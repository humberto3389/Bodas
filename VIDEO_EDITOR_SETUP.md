# Video Editor Feature - Installation Guide

## Dependencies Required

The video editor feature requires FFmpeg.wasm for client-side video processing. Due to PowerShell execution policies, you'll need to install these dependencies manually.

### Installation Steps

1. Open PowerShell as Administrator
2. Navigate to your project directory:
   ```powershell
   cd C:\Users\mhual\OneDrive\Desktop\Invitacion
   ```

3. Install the required packages:
   ```powershell
   npm install @ffmpeg/ffmpeg@0.12.10 @ffmpeg/util@0.12.1
   ```

### Alternative: Using CMD

If PowerShell continues to have issues, use Command Prompt instead:

1. Open Command Prompt (cmd)
2. Navigate to project:
   ```cmd
   cd C:\Users\mhual\OneDrive\Desktop\Invitacion
   ```

3. Install packages:
   ```cmd
   npm install @ffmpeg/ffmpeg@0.12.10 @ffmpeg/util@0.12.1
   ```

## Features Implemented

Once dependencies are installed, the video editor will provide:

- ✂️ **Trim/Cut**: Select start and end points on the timeline
- 🔇 **Audio Toggle**: Enable or disable audio
- ⚡ **Speed Control**: 0.5x, 1x, 1.5x, 2x playback speeds
- 🎨 **Filters**: Sepia, B&W, Brightness, Contrast, Vintage, Warm, Cool
- 👁️ **Real-time Preview**: See changes before processing
- 💾 **Save & Publish**: Process and upload edited videos

## Usage

1. Go to Admin Panel → Multimedia section
2. Upload a video
3. Click the **Edit** button (pencil icon) on any uploaded video
4. Make your edits using the controls
5. Click **Guardar y Publicar** to process and save
6. The edited video will appear in the Cinema section on the frontend

## Notes

- Original videos are preserved; edited versions are saved separately
- Processing time depends on video size and edits applied
- Large videos (>50MB) may take several minutes to process
- All processing happens in the browser using WebAssembly
