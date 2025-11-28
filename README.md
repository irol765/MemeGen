
# MemeGen Pro - AI Sticker Maker

A modern React application that turns photos into LINE-style sticker packs using Google's Gemini 3 Pro (Nano Banana Pro) model.

## Features

1.  **AI Generation**: Uses `gemini-3-pro-image-preview` to generate high-quality, 4K resolution sticker sheets (4x6 layout) from a reference photo.
2.  **Smart Editor**:
    *   **Background Removal**: Client-side algorithm to remove white backgrounds and make stickers transparent.
    *   **Slicing**: Automatically cuts the grid into individual PNG files based on customizable rows/columns and padding. Includes Offset (X/Y) controls to perfectly frame each sticker.
3.  **Export**: Downloads the sticker set as a ZIP file.
4.  **Customizable Prompts**: Adjust the generation style and text language.
5.  **Multi-language Support**: Switch between English and Chinese interfaces.

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
    
    *Note: If `API_KEY` is provided, the app will use it directly. If not provided, the app may attempt to use the AI Studio popup flow (which only works in specific playground environments).*

4.  Deploy! Vercel will automatically detect the React framework and build the project.

## Usage Guide

1.  **Upload**: Drag and drop a photo of a person or character.
2.  **Prompt**: Review the default prompt. It is optimized for "Q-version, LINE style, 4x6 layout, Chinese text (top-right)". Click "Generate".
3.  **Key Selection**: If you haven't set an API_KEY env var (local dev), select your key in the popup.
4.  **Edit**:
    *   Use the "White Tolerance" slider to make the background transparent.
    *   Adjust "Padding" and "Offsets" to crop the stickers tightly.
5.  **Download**: Click "Download ZIP" to get your sticker pack.
