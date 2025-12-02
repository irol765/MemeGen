# MemeGen Pro - AI Sticker Maker

[中文文档](README_zh.md)
![image](https://github.com/irol765/MemeGen/blob/main/img/en.png)
A modern React application that turns photos into LINE/WeChat-style sticker packs using Google's Gemini 3 Pro (Nano Banana Pro) model.

## Features

1.  **AI Generation**: Uses `gemini-3-pro-image-preview` to generate high-quality, 4K resolution sticker sheets from a reference photo.
2.  **Multi-Mode Support**:
    *   **Sticker Sheet**: Generates a 4x6 grid of static stickers.
    *   **Animated GIF**: Generates a sprite sheet and synthesizes it into a looping GIF animation.
3.  **Shop Asset Generator**: Automatically designs all required assets for sticker shops (WeChat/LINE):
    *   **Banner**: Promotional banner (750x400).
    *   **Cover**: Main package cover (230x230).
    *   **Icon**: Small list icon (50x50).
    *   **Donation Guide**: Image to encourage donations (750x560).
    *   **Thank You Image**: Image shown after donation (750x750).
4.  **Smart Editor**:
    *   **Background Removal**: Client-side algorithm (Chroma Key) to remove the generated green screen background.
    *   **Slicing**: Automatically cuts grids into individual PNG files.
    *   **GIF Synthesis**: Compiles frames into a smooth GIF with adjustable FPS.
5.  **Export**: Downloads sticker sets as ZIP files or individual assets as PNGs.
6.  **Security**: Optional access code protection for deployments.

## Prerequisites

*   Node.js 18+
*   A Google Cloud Project with Gemini API enabled.
*   **Important**: This app uses the paid `gemini-3-pro-image-preview` model.

## Development

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm start
    ```

## Deployment on Vercel

1.  Push this code to a GitHub repository.
2.  Import the repository into Vercel.
3.  **Environment Variables**:
    Go to your Vercel Project Settings > Environment Variables and add:
    *   `API_KEY`: Your Google Gemini API Key.
    *   `ACCESS_CODE` (Optional): A password/code to protect your deployment. If set, users must enter this code to use the app.
    
    *Note: If `API_KEY` is provided, the app will use it directly. If `ACCESS_CODE` is set, the app will show a lock screen.*

4.  Deploy! Vercel will automatically detect the React framework and build the project.

## Usage Guide

1.  **Security**: If an `ACCESS_CODE` is deployed, enter it to unlock the app.
2.  **Upload**: Drag and drop a photo of a person or character.
3.  **Prompt**: 
    *   **Stickers**: Uses an optimized prompt for "Q-version, LINE style, 4x6 layout".
    *   **GIF**: Enter a specific action (e.g., "Running") to generate a sprite sheet.
4.  **Edit & Export**:
    *   **Sticker Sheet**: Adjust "Color Tolerance" to remove the green background. Slice and download as ZIP.
    *   **GIF**: Adjust grid to frame the action, select FPS, and synthesize the GIF.
    *   **Shop Assets**: Switch tabs (Banner, Cover, Icon, etc.) to generate and download specific store assets.
