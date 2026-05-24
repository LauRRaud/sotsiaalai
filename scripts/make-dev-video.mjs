#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import sharp from 'sharp';

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const LEAD_DURATIONS = [3, 2.5, 2.5];
const DEFAULTS = {
  inputFolder: path.resolve('dev-video/source'),
  outputFile: path.resolve('dev-video/output/sotsiaalai-1-aasta-arendus-test-1920x1080.mp4'),
  imageDuration: 1,
  fadeDuration: 0,
  manifest: path.resolve('dev-video/categories.json'),
  resolution: '1920x1080',
  introCount: 3,
  introDuration: 3,
  outroCount: 10,
  outroDuration: 2,
  fps: 30,
  contactThumbWidth: 160,
  contactThumbHeight: 90,
};

function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const [rawKey, inlineValue] = token.slice(2).split('=', 2);
    const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const nextValue = inlineValue ?? argv[i + 1];
    if (inlineValue == null) {
      if (!nextValue || nextValue.startsWith('--')) {
        throw new Error(`Missing value for ${token}`);
      }
      i += 1;
    }
    switch (key) {
      case 'inputFolder':
        args.inputFolder = path.resolve(nextValue);
        break;
      case 'manifest':
        args.manifest = path.resolve(nextValue);
        break;
      case 'outputFile':
        args.outputFile = path.resolve(nextValue);
        break;
      case 'imageDuration':
      case 'middleDuration':
        args.imageDuration = Number(nextValue);
        break;
      case 'fadeDuration':
        args.fadeDuration = Number(nextValue);
        break;
      case 'resolution':
        args.resolution = String(nextValue);
        break;
      case 'introCount':
        args.introCount = Number(nextValue);
        break;
      case 'introDuration':
        args.introDuration = Number(nextValue);
        break;
      case 'outroCount':
      case 'tailCount':
        args.outroCount = Number(nextValue);
        break;
      case 'outroDuration':
      case 'tailDuration':
        args.outroDuration = Number(nextValue);
        break;
      case 'fps':
        args.fps = Number(nextValue);
        break;
      case 'contactThumbWidth':
        args.contactThumbWidth = Number(nextValue);
        break;
      case 'contactThumbHeight':
        args.contactThumbHeight = Number(nextValue);
        break;
      default:
        throw new Error(`Unknown option: ${token}`);
    }
  }
  return args;
}

function parseResolution(value) {
  const match = /^(\d+)\s*[x:]\s*(\d+)$/i.exec(value);
  if (!match) {
    throw new Error(`Invalid resolution "${value}". Use WIDTHxHEIGHT, for example 1920x1080.`);
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

function formatSeconds(value) {
  return Number(value).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function run(command, args, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    let stdout = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(
        new Error(
          `${label} failed with exit code ${code}${stderr ? `\n${stderr.trim()}` : ''}${stdout ? `\n${stdout.trim()}` : ''}`
        )
      );
    });
  });
}

async function readInputFiles(inputFolder) {
  const entries = await fs.readdir(inputFolder, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => path.join(inputFolder, entry.name))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b), 'en', { numeric: true, sensitivity: 'base' }));
}

async function readCategorizedFilesFromFolders(inputFolder) {
  const entries = await fs.readdir(inputFolder, { withFileTypes: true });
  const categories = entries.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' }));
  if (categories.length === 0) {
    return null;
  }

  const grouped = [];
  for (const category of categories) {
    const categoryDir = path.join(inputFolder, category.name);
    const files = (await fs.readdir(categoryDir, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => path.join(categoryDir, entry.name))
      .sort((a, b) => path.basename(a).localeCompare(path.basename(b), 'en', { numeric: true, sensitivity: 'base' }));
    if (files.length > 0) {
      grouped.push({ name: category.name, files });
    }
  }
  return grouped.length > 0 ? grouped : null;
}

async function readCategorizedFilesFromManifest(inputFolder, manifestPath) {
  try {
    await fs.access(manifestPath);
  } catch {
    return null;
  }

  const raw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  if (!Array.isArray(manifest.sections)) {
    throw new Error(`Invalid manifest: expected a sections array in ${manifestPath}`);
  }

  const flatFiles = await readInputFiles(inputFolder);
  const grouped = [];
  for (const section of manifest.sections) {
    if (!section || typeof section !== 'object') continue;
    const name = String(section.name || section.label || 'section');
    let files = [];
    if (Array.isArray(section.files)) {
      files = section.files.map((fileName) => path.resolve(inputFolder, fileName));
    } else if (Number.isInteger(section.from) && Number.isInteger(section.to)) {
      files = flatFiles.slice(Math.max(0, section.from - 1), Math.max(0, section.to));
    } else {
      throw new Error(`Invalid section in manifest for "${name}": use either files[] or from/to.`);
    }
    files = files.filter((file) => SUPPORTED_EXTENSIONS.has(path.extname(file).toLowerCase()));
    if (files.length > 0) {
      grouped.push({ name, files });
    }
  }
  return grouped.length > 0 ? grouped : null;
}

async function createTempLinks(files, tempDir) {
  await fs.mkdir(tempDir, { recursive: true });
  const linkedFiles = [];
  for (let i = 0; i < files.length; i += 1) {
    const source = files[i];
    const extension = path.extname(source).toLowerCase() || '.png';
    const target = path.join(tempDir, `${String(i + 1).padStart(4, '0')}${extension}`);
    try {
      await fs.link(source, target);
    } catch {
      await fs.copyFile(source, target);
    }
    linkedFiles.push(target);
  }
  return linkedFiles;
}

async function resolveOrderedFiles(options) {
  const folderGroups = await readCategorizedFilesFromFolders(options.inputFolder);
  if (folderGroups) {
    return folderGroups.flatMap((group) => group.files);
  }

  const manifestGroups = await readCategorizedFilesFromManifest(options.inputFolder, options.manifest);
  if (manifestGroups) {
    return manifestGroups.flatMap((group) => group.files);
  }

  return readInputFiles(options.inputFolder);
}

function buildImageFilterGraph(inputCount, width, height, fade, durations) {
  const lines = [];
  for (let i = 0; i < inputCount; i += 1) {
    const duration = formatSeconds(durations[i]);
    lines.push(
      `[${i}:v]trim=duration=${duration},setpts=PTS-STARTPTS,split=2[bgsrc${i}][fgsrc${i}]`
    );
    lines.push(
      `[bgsrc${i}]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},boxblur=18:1,eq=brightness=-0.22:saturation=0.85,format=rgba,setsar=1[bg${i}]`
    );
    lines.push(
      `[fgsrc${i}]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black@0,format=rgba,setsar=1[fg${i}]`
    );
    lines.push(`[bg${i}][fg${i}]overlay=(W-w)/2:(H-h)/2:format=auto,format=yuv420p,setsar=1[slide${i}]`);
  }

  if (fade > 0) {
    let currentLabel = 'slide0';
    for (let i = 1; i < inputCount; i += 1) {
      const offset = durations.slice(0, i).reduce((sum, value) => sum + value, 0) - fade * i;
      const nextLabel = i === inputCount - 1 ? 'vout' : `xf${i}`;
      lines.push(
        `[${currentLabel}][slide${i}]xfade=transition=fade:duration=${formatSeconds(
          fade
        )}:offset=${formatSeconds(offset)}[${nextLabel}]`
      );
      currentLabel = nextLabel;
    }
  } else if (inputCount === 1) {
    lines.push(`[slide0]format=yuv420p[vout]`);
  } else {
    const concatInputs = Array.from({ length: inputCount }, (_, index) => `[slide${index}]`).join('');
    lines.push(`${concatInputs}concat=n=${inputCount}:v=1:a=0[vout]`);
  }

  return lines.join(';\n');
}

function buildDurationMap(fileCount, middleDuration, tailCount, tailDuration) {
  const effectiveLeadCount = Math.min(LEAD_DURATIONS.length, fileCount);
  const remainingAfterLead = Math.max(0, fileCount - effectiveLeadCount);
  const effectiveTailCount = Math.min(Math.max(tailCount, 0), remainingAfterLead);
  const tailStart = fileCount - effectiveTailCount;
  return Array.from({ length: fileCount }, (_, index) => {
    if (index < effectiveLeadCount) {
      return LEAD_DURATIONS[index];
    }
    if (index >= tailStart) {
      return tailDuration;
    }
    return middleDuration;
  });
}

async function createContactSheet(files, outputFile, columns, thumbWidth, thumbHeight, padding = 8) {
  const rows = Math.ceil(files.length / columns);
  const canvasWidth = columns * thumbWidth + (columns + 1) * padding;
  const canvasHeight = rows * thumbHeight + (rows + 1) * padding;

  const composites = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const left = padding + (i % columns) * (thumbWidth + padding);
    const top = padding + Math.floor(i / columns) * (thumbHeight + padding);
    const buffer = await sharp(file)
      .rotate()
      .resize(thumbWidth, thumbHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      })
      .png()
      .toBuffer();
    composites.push({ input: buffer, left, top });
  }

  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 3,
      background: '#111111',
    },
  })
    .composite(composites)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outputFile);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { width, height } = parseResolution(options.resolution);

  if (!Number.isFinite(options.imageDuration) || options.imageDuration <= 0) {
    throw new Error('--image-duration must be a positive number.');
  }
  if (!Number.isFinite(options.fadeDuration) || options.fadeDuration < 0) {
    throw new Error('--fade-duration must be zero or a positive number.');
  }
  if (options.fadeDuration > 0 && options.imageDuration <= options.fadeDuration) {
    throw new Error('Middle duration must be longer than the fade duration.');
  }
  if (width <= 0 || height <= 0) {
    throw new Error('Resolution must be positive.');
  }

  const inputFiles = await resolveOrderedFiles(options);
  if (inputFiles.length === 0) {
    throw new Error(`No supported image files found in ${options.inputFolder}`);
  }

  const outputDir = path.dirname(options.outputFile);
  const contactSheetFile = path.join(outputDir, 'contact-sheet.jpg');
  await fs.mkdir(outputDir, { recursive: true });

  const tempRoot = path.join(path.dirname(outputDir), '.tmp-dev-video');
  await fs.mkdir(tempRoot, { recursive: true });
  const tempDir = await fs.mkdtemp(path.join(tempRoot, 'dev-video-'));
  try {
    const usedFiles = await createTempLinks(inputFiles, tempDir);
    const durations = buildDurationMap(usedFiles.length, options.imageDuration, options.outroCount, options.outroDuration);
    const totalDuration = durations.reduce((sum, value) => sum + value, 0) - Math.max(0, options.fadeDuration) * (durations.length - 1);

    const videoFilterScript = buildImageFilterGraph(
      usedFiles.length,
      width,
      height,
      options.fadeDuration,
      durations
    );
    const videoFilterFile = path.join(tempDir, 'video-filtergraph.txt');
    await fs.writeFile(videoFilterFile, videoFilterScript, 'utf8');

    const videoArgs = ['-hide_banner', '-y'];
    for (const file of usedFiles) {
      videoArgs.push('-framerate', String(options.fps), '-loop', '1', '-i', file);
    }
    videoArgs.push(
      '-filter_complex_script',
      videoFilterFile,
      '-map',
      '[vout]',
      '-r',
      String(options.fps),
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      '18',
      '-preset',
      'medium',
      '-movflags',
      '+faststart',
      options.outputFile
    );

    console.log(`Building video from ${usedFiles.length} images`);
    console.log(`Ordering source: ${options.manifest}`);
    console.log('Timing profile: first 3 images = 3s, 2.5s, 2.5s; middle images = 1s; last images = 2s; fade = 0s');
    console.log(`Target duration: about ${formatSeconds(totalDuration)}s`);
    await run('ffmpeg', videoArgs, 'FFmpeg video render');

    const sheetColumns = clamp(Math.ceil(Math.sqrt(usedFiles.length)), 4, 12);
    await createContactSheet(
      usedFiles,
      contactSheetFile,
      sheetColumns,
      options.contactThumbWidth,
      options.contactThumbHeight
    );

    console.log(`Video written to ${options.outputFile}`);
    console.log(`Contact sheet written to ${contactSheetFile}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
