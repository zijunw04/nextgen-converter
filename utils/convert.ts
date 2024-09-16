import { Action } from '@/types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

function getFileExtension(file_name: string) {
  return file_name.split('.').pop() || '';
}

function removeFileExtension(file_name: string) {
  return file_name.substring(0, file_name.lastIndexOf('.')) || file_name;
}

export default async function convert(
  ffmpeg: FFmpeg,
  action: Action,
  onProgress: (progress: number, speed: number) => void
): Promise<{ url: string; output: string }> {
  const { file, to, file_name } = action;
  const input = file_name;
  const output = `${removeFileExtension(file_name)}.${to}`;
  
  try {
    await ffmpeg.writeFile(input, await fetchFile(file));
    let ffmpeg_cmd: string[] = ['-i', input];

    ffmpeg_cmd.push('-preset', 'ultrafast', '-crf', '35');

    if (to === '3gp') {
      ffmpeg_cmd = ffmpeg_cmd.concat([
        '-r', '20',
        '-s', '352x288',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-b:a', '24k',
        '-ac', '1',
        '-ar', '8000'
      ]);
    } else if (to === 'png' && getFileExtension(input).toLowerCase() === 'jpg') {
      ffmpeg_cmd.push('-vf', 'format=rgba');
    }

    ffmpeg_cmd.push(output);

    let startTime = Date.now();
    let lastProgress = 0;

    await new Promise<void>((resolve, reject) => {
      ffmpeg.on('progress', (event) => {
        const now = Date.now();
        const timeDiff = (now - startTime) / 1000;
        const progress = event.progress || 0;
        const progressDiff = progress - lastProgress;
        
        if (timeDiff > 0) {
          const speed = (progressDiff * file.size) / timeDiff || 0; 
          onProgress(progress, speed);
        }

        lastProgress = progress;
        startTime = now;
      });

      ffmpeg.exec(ffmpeg_cmd)
        .then(() => resolve())
        .catch((error) => {
          console.error('FFmpeg conversion error:', error);
          reject(error);
        });
    });

    const data = await ffmpeg.readFile(output);
    const blob = new Blob([data], { type: `${file.type.split('/')[0]}/${to}` });
    const url = URL.createObjectURL(blob);
    return { url, output };
  } catch (error) {
    console.error('Conversion failed:', error);
    throw error;
  }
}

