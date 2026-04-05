// 用于匹配 VTT/SRT 时间行（支持默认小时省略、多位数小时以及 1 到 3 位毫秒值）
export const VTT_SRT_TIME = /^(?:\d+:)?\d{2}:\d{2}[,.]\d{1,3} --> (?:\d+:)?\d{2}:\d{2}[,.]\d{1,3}/;
// LRC 格式的时间标记正则表达式
export const LRC_TIME_REGEX = /^\[\d{2}:\d{2}(\.\d{2,3})?\]/;
const LRC_METADATA_REGEX = /^\[(ar|ti|al|by|offset|re|ve):/i;

// 识别字幕文件的类型
export const detectSubtitleFormat = (lines: string[]): "ass" | "vtt" | "srt" | "lrc" | "error" => {
  // 获取前 50 行，并去除其中的空行
  const nonEmptyLines = lines.slice(0, 50).filter((line) => line.trim().length > 0);
  let assCount = 0,
    vttCount = 0,
    srtCount = 0,
    lrcCount = 0;

  for (let i = 0; i < nonEmptyLines.length; i++) {
    const trimmed = nonEmptyLines[i].trim();

    // ASS 格式判断：如果存在 [script info]，或对话行符合 ASS 格式
    if (/^\[script info\]/i.test(trimmed)) return "ass";

    // 如果第一行是 WEBVTT 标识，则为 VTT 格式
    if (i === 0 && /^WEBVTT($|\s)/i.test(trimmed)) return "vtt";

    if (/^dialogue:\s*\d+,[^,]*,[^,]*,/i.test(trimmed)) {
      assCount++;
    }
    // 匹配时间行
    if (VTT_SRT_TIME.test(trimmed)) {
      if (trimmed.includes(",")) {
        srtCount++;
      } else if (trimmed.includes(".")) {
        vttCount++;
      }
    }
    // 检测LRC格式的时间标记
    if (LRC_TIME_REGEX.test(trimmed)) {
      lrcCount++;
    }
    if (LRC_METADATA_REGEX.test(trimmed)) {
      lrcCount++;
    }
  }

  // 根据时间行分隔符数量判断
  if (assCount > 0 && assCount >= Math.max(vttCount, srtCount, lrcCount)) {
    return "ass";
  }
  if (lrcCount > 0 && lrcCount >= Math.max(vttCount, srtCount)) {
    return "lrc";
  }
  if (vttCount > srtCount) return "vtt";
  if (srtCount > 0) return "srt";
  return "error";
};

export const getOutputFileExtension = (fileType: string, bilingualSubtitle: boolean): string => {
  if (fileType === "lrc") {
    return "lrc";
  } else if (bilingualSubtitle || fileType === "ass") {
    return "ass";
  } else if (fileType === "vtt") {
    return "vtt";
  } else {
    return "srt";
  }
};

// 预编译正则表达式用于检测纯数字行
const INTEGER_REGEX = /^\d+$/;
// 检测当前行是否为整数和空行
const isValidSubtitleLine = (str: string): boolean => {
  const trimmedStr = str.trim();
  return trimmedStr !== "" && !INTEGER_REGEX.test(trimmedStr);
};

export const filterSubLines = (lines: string[], fileType: string) => {
  const contentLines: string[] = [];
  const contentIndices: number[] = [];
  const styleBlockLines: string[] = [];
  let startExtracting = false;
  let assContentStartIndex = 9;
  let formatFound = false;

  if (fileType === "ass") {
    const eventIndex = lines.findIndex((line) => line.trim() === "[Events]");
    if (eventIndex !== -1) {
      for (let i = eventIndex; i < lines.length; i++) {
        if (lines[i].startsWith("Format:")) {
          const formatLine = lines[i];
          assContentStartIndex = formatLine.split(",").length - 1;
          formatFound = true;
          break;
        }
      }
    }

    if (!formatFound) {
      const dialogueLines = lines.filter((line) => line.startsWith("Dialogue:")).slice(0, 100);
      if (dialogueLines.length > 0) {
        const commaCounts = dialogueLines.map((line) => line.split(",").length - 1);
        assContentStartIndex = Math.min(...commaCounts);
      }
    }
  }

  lines.forEach((line, index) => {
    let isContent = false;
    let extractedContent = "";
    const trimmedLine = line.trim();

    if (fileType === "srt" || fileType === "vtt") {
      if (!startExtracting) {
        const isTimecode = /^[\d:,]+ --> [\d:,]+/.test(line) || /^[\d:.]+ --> [\d:.]+/.test(line);
        if (isTimecode) {
          startExtracting = true;
        }
      }

      if (startExtracting) {
        if (fileType === "vtt") {
          const isTimecode = /^[\d:.]+ --> [\d:.]+/.test(trimmedLine);
          const isWebVTTHeader = trimmedLine.startsWith("WEBVTT");
          const isComment = trimmedLine.startsWith("#");
          isContent = isValidSubtitleLine(line) && !isTimecode && !isWebVTTHeader && !isComment;
          // Strip YouTube VTT inline tags: <c>, </c>, and karaoke timestamps like <00:00:06.040>
          extractedContent = line.replace(/<\/?c>/g, "").replace(/<[\d:.]+>/g, "");
        } else {
          const isTimecode = /^[\d:,]+ --> [\d:,]+/.test(trimmedLine);
          isContent = isValidSubtitleLine(line) && !isTimecode;
          extractedContent = line;
        }
      }
    } else if (fileType === "lrc") {
      if (!startExtracting && LRC_TIME_REGEX.test(trimmedLine)) {
        startExtracting = true;
      }

      if (startExtracting) {
        extractedContent = trimmedLine.replace(/\[\d{2}:\d{2}(\.\d{2,3})?\]/g, "").trim();
        // 只有当去除时间标记后内容不为空时，才认为是有效内容
        isContent = isValidSubtitleLine(line);
      }
    } else if (fileType === "ass") {
      if (!startExtracting && trimmedLine.startsWith("Dialogue:")) {
        startExtracting = true;
      }

      if (startExtracting) {
        const parts = line.split(",");
        if (line.startsWith("Dialogue:") && parts.length > assContentStartIndex) {
          extractedContent = parts.slice(assContentStartIndex).join(",").trim();
          isContent = isValidSubtitleLine(line);
        }
      }
    }

    if (isContent) {
      contentLines.push(extractedContent);
      contentIndices.push(index);
    }
  });

  return { contentLines, contentIndices, styleBlockLines, assContentStartIndex };
};

// 将 WebVTT 或 SRT 的时间格式 "00:01:32.783" 或 "00:01:32,783" 转换为 ASS 的时间格式 "0:01:32.78"
// 同时处理有小时和无小时的情况
const TIME_REGEX = /^(?:(\d+):)?(\d{2}):(\d{2})[,.](\d{1,3})$/;
export const convertTimeToAss = (time: string): string => {
  const match = time.match(TIME_REGEX);
  if (!match) return time;
  const [, hours, minutes, seconds, ms] = match;
  // 处理毫秒：确保转换为两位厘秒。如果输入是毫秒（3 位数），取前两位；如果只有一位数如 9，用 0 填充，显示为 09。
  const msValue = ms.length >= 2 ? ms.substring(0, 2) : ms.padStart(2, "0");
  return `${parseInt(hours || "0", 10)}:${minutes}:${seconds}.${msValue}`;
};

// ASS 覆盖标签处理：翻译前剥离，翻译后还原
// 匹配行首连续的 ASS 覆盖标签块，如 {\an8}、{\an8\i1\b1}
const ASS_LEADING_TAGS_REGEX = /^(\{[^}]*\})+/;
// 匹配所有 ASS 覆盖标签块（用于剥离内联标签）
const ASS_ALL_TAGS_REGEX = /\{[^}]*\}/g;
// 匹配 ASS 换行符 \N 和 \n（字面反斜杠+字母，非转义字符）
const ASS_NEWLINE_REGEX = /\\[Nn]/g;

interface AssTagMap {
  /** 行首的覆盖标签，如 "{\an8}" */
  leadingTags: string;
}

/**
 * 翻译前：剥离 ASS 覆盖标签，将 \N/\n 转为真实换行
 * - {\...} 头部标签记录后剥离，内联标签直接剥离
 * - \N/\n 转为 \n，让 AI 自然理解换行
 */
export const prepareAssForTranslation = (contentLines: string[]): { cleanLines: string[]; tagMaps: AssTagMap[] } => {
  const cleanLines: string[] = [];
  const tagMaps: AssTagMap[] = [];

  for (const line of contentLines) {
    // 1. 提取行首的连续覆盖标签
    let leadingTags = "";
    let remaining = line;
    const leadingMatch = line.match(ASS_LEADING_TAGS_REGEX);
    if (leadingMatch) {
      leadingTags = leadingMatch[0];
      remaining = line.substring(leadingTags.length);
    }

    // 2. 剥离剩余文本中的内联覆盖标签
    remaining = remaining.replace(ASS_ALL_TAGS_REGEX, "");

    // 3. 将 ASS 换行符 \N/\n 转为真实换行
    remaining = remaining.replace(ASS_NEWLINE_REGEX, "\n");

    tagMaps.push({ leadingTags });
    cleanLines.push(remaining);
  }

  return { cleanLines, tagMaps };
};

/**
 * 翻译后：将真实换行转回 \N，还原行首覆盖标签
 */
export const restoreAssAfterTranslation = (translatedLines: string[], tagMaps: AssTagMap[]): string[] => {
  return translatedLines.map((line, i) => {
    const map = tagMaps[i];
    if (!map) return line;

    // 1. 将真实换行转回 ASS 硬换行 \N
    let restored = line.replace(/\n/g, "\\N");

    // 2. 还原行首覆盖标签
    if (map.leadingTags) {
      restored = map.leadingTags + restored;
    }

    return restored;
  });
};

// ASS 文件头模板
export const assHeader = `[Script Info]
Title: Bilingual Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: Yes
PlayResX: 1920
PlayResY: 1080
Collisions: Normal

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans,70,&H00FFFFFF,&H0000FFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,2,30,30,35,1
Style: Secondary,Noto Sans,55,&H003CF7F4,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,2,30,30,35,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

// ==========================================
// Phase 4: Timing Adjustment & Merge/Split
// ==========================================

/**
 * Shift all subtitle timestamps by a given offset (in milliseconds).
 * Positive = delay, Negative = advance.
 * Supports SRT, VTT, and ASS formats.
 */
export const shiftTimestamps = (content: string, offsetMs: number): string => {
  if (offsetMs === 0 || !content.trim()) return content;

  const lines = content.split("\n");
  const shiftedLines = lines.map((line) => {
    const trimmed = line.trim();

    // SRT/VTT time shift: 00:01:32,783 --> 00:01:35,123
    if (VTT_SRT_TIME.test(trimmed)) {
      return trimmed.replace(
        /((?:\d+:)?\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*((?:\d+:)?\d{2}:\d{2}[,.]\d{1,3})/,
        (_match, start, end) => {
          const newStart = shiftTime(start, offsetMs);
          const newEnd = shiftTime(end, offsetMs);
          return `${newStart} --> ${newEnd}`;
        }
      );
    }

    // ASS Dialogue line time shift
    if (/^Dialogue:\s*\d+,/.test(trimmed)) {
      const commaIdx = trimmed.indexOf(",");
      const startCommaIdx = trimmed.indexOf(",", commaIdx + 1);
      const endCommaIdx = trimmed.indexOf(",", startCommaIdx + 1);
      if (startCommaIdx !== -1 && endCommaIdx !== -1) {
        const startTime = trimmed.substring(commaIdx + 1, startCommaIdx).trim();
        const endTime = trimmed.substring(startCommaIdx + 1, endCommaIdx).trim();
        const newStart = shiftTimeAss(startTime, offsetMs);
        const newEnd = shiftTimeAss(endTime, offsetMs);
        return line.replace(startTime, newStart).replace(endTime, newEnd);
      }
    }

    // LRC time shift: [00:12.34]
    if (LRC_TIME_REGEX.test(trimmed)) {
      return trimmed.replace(LRC_TIME_REGEX, (match) => {
        const timeMatch = match.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/);
        if (!timeMatch) return match;
        const mins = parseInt(timeMatch[1], 10);
        const secs = parseInt(timeMatch[2], 10);
        const ms = timeMatch[3] ? parseInt(timeMatch[3].padEnd(3, "0"), 10) : 0;
        const totalMs = mins * 60 * 1000 + secs * 1000 + ms + offsetMs;
        if (totalMs < 0) return match;
        const newMins = Math.floor(totalMs / 60000);
        const newSecs = Math.floor((totalMs % 60000) / 1000);
        const newMs = Math.floor((totalMs % 1000) / 10);
        return `[${String(newMins).padStart(2, "0")}:${String(newSecs).padStart(2, "0")}.${String(newMs).padStart(2, "0")}]`;
      });
    }

    return line;
  });

  return shiftedLines.join("\n");
};

/**
 * Shift an SRT/VTT time string by offsetMs.
 */
const shiftTime = (time: string, offsetMs: number): string => {
  const match = time.match(/^((\d+):)?(\d{2}):(\d{2})[,.](\d{1,3})$/);
  if (!match) return time;
  const hours = parseInt(match[2] || "0", 10);
  const mins = parseInt(match[3], 10);
  const secs = parseInt(match[4], 10);
  const ms = parseInt(match[5].padEnd(3, "0"), 10);
  const totalMs = hours * 3600000 + mins * 60000 + secs * 1000 + ms + offsetMs;
  if (totalMs < 0) return time;
  const newHours = Math.floor(totalMs / 3600000);
  const newMins = Math.floor((totalMs % 3600000) / 60000);
  const newSecs = Math.floor((totalMs % 60000) / 1000);
  const newMs = Math.floor((totalMs % 1000) / 10);
  const sep = time.includes(",") ? "," : ".";
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}:${String(newSecs).padStart(2, "0")}${sep}${String(newMs).padStart(2, "0")}`;
};

/**
 * Shift an ASS time string by offsetMs.
 */
const shiftTimeAss = (time: string, offsetMs: number): string => {
  const match = time.match(/^(\d+):(\d{2}):(\d{2})\.(\d{2})$/);
  if (!match) return time;
  const hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const secs = parseInt(match[3], 10);
  const cs = parseInt(match[4], 10); // centiseconds
  const totalMs = hours * 3600000 + mins * 60000 + secs * 1000 + cs * 10 + offsetMs;
  if (totalMs < 0) return time;
  const newHours = Math.floor(totalMs / 3600000);
  const newMins = Math.floor((totalMs % 3600000) / 60000);
  const newSecs = Math.floor((totalMs % 60000) / 1000);
  const newCs = Math.floor((totalMs % 1000) / 10);
  return `${newHours}:${String(newMins).padStart(2, "0")}:${String(newSecs).padStart(2, "0")}.${String(newCs).padStart(2, "0")}`;
};

/**
 * Merge short consecutive subtitle lines into a single line.
 * Lines separated by less than maxGapMs are merged.
 * Returns the merged subtitle content.
 */
export const mergeSubtitleLines = (content: string, maxGapMs: number = 300): string => {
  const lines = content.split("\n");
  const fileType = detectSubtitleFormat(lines);
  if (fileType === "error") return content;

  const { contentLines, contentIndices, styleBlockLines, assContentStartIndex } = filterSubLines(lines, fileType);
  if (contentLines.length <= 1) return content;

  // Group consecutive content lines and check time gaps
  const groups: { indices: number[]; texts: string[] }[] = [];
  let currentGroup = { indices: [contentIndices[0]], texts: [contentLines[0]] };

  for (let i = 1; i < contentIndices.length; i++) {
    const prevIdx = contentIndices[i - 1];
    const currIdx = contentIndices[i];

    // Check if lines are consecutive (no time gap or small gap)
    const gap = currIdx - prevIdx;
    if (gap <= maxGapMs) {
      currentGroup.indices.push(currIdx);
      currentGroup.texts.push(contentLines[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = { indices: [currIdx], texts: [contentLines[i]] };
    }
  }
  groups.push(currentGroup);

  // Rebuild subtitle with merged lines
  const resultLines = [...lines];
  for (const group of groups) {
    if (group.texts.length > 1) {
      const mergedText = group.texts.join(" ");
      for (let i = 0; i < group.indices.length; i++) {
        if (i === 0) {
          resultLines[group.indices[i]] = mergedText;
        } else {
          resultLines[group.indices[i]] = "";
        }
      }
    }
  }

  return resultLines.filter((l) => l.trim() !== "" || /^[\d[\s:,-]*$/.test(l.trim()) || l.startsWith("[") || l.startsWith("WEBVTT")).join("\n");
};

/**
 * Split long subtitle lines (> maxChars) into two separate entries.
 * Splits at the nearest space or punctuation.
 */
export const splitSubtitleLines = (content: string, maxChars: number = 60): string => {
  const lines = content.split("\n");
  const fileType = detectSubtitleFormat(lines);
  if (fileType === "error") return content;

  const { contentLines, contentIndices } = filterSubLines(lines, fileType);

  const resultLines = [...lines];

  // Process from bottom to top to avoid index shifting issues
  for (let i = contentIndices.length - 1; i >= 0; i--) {
    const lineIdx = contentIndices[i];
    const text = contentLines[i];

    if (text.length > maxChars) {
      // Find best split point (prefer space, then punctuation)
      const halfLen = Math.floor(text.length / 2);
      let splitIdx = -1;

      // Search for space near the middle
      for (let offset = 0; offset < 20; offset++) {
        const forwardIdx = halfLen + offset;
        if (forwardIdx < text.length && text[forwardIdx] === " ") {
          splitIdx = forwardIdx;
          break;
        }
        const backwardIdx = halfLen - offset;
        if (backwardIdx >= 0 && text[backwardIdx] === " ") {
          splitIdx = backwardIdx;
          break;
        }
      }

      // If no space found, try punctuation
      if (splitIdx === -1) {
        for (let offset = 0; offset < 15; offset++) {
          const forwardIdx = halfLen + offset;
          if (forwardIdx < text.length && /[,.，。、;；]/.test(text[forwardIdx])) {
            splitIdx = forwardIdx + 1;
            break;
          }
        }
      }

      if (splitIdx > 0) {
        const part1 = text.substring(0, splitIdx).trim();
        const part2 = text.substring(splitIdx).trim();

        if (fileType === "srt" || fileType === "vtt") {
          // For SRT/VTT, join with \N for inline split
          resultLines[lineIdx] = `${part1}\\N${part2}`;
        } else if (fileType === "ass") {
          resultLines[lineIdx] = resultLines[lineIdx].replace(
            new RegExp(`,${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
            `,${part1}\\N${part2}`
          );
        } else {
          resultLines[lineIdx] = `${part1} / ${part2}`;
        }
      }
    }
  }

  return resultLines.join("\n");
};
