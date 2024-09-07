# Taking Note

## Overview

Taking Note is a web application built with React and Vite, designed to help users manage and share their dreams. The application uses Auth0 for authentication and Prisma with a PostgreSQL database for data management.

## Features

- User authentication with Auth0
- Manage personal dreams
- View all public dreams
- Theme selection with DaisyUI and TailwindCSS

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/taking-note.git
   cd taking-note
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:

   ```env
   VITE_CLIENT_DOMAIN=your-auth0-domain
   VITE_CLIENT_ID=your-auth0-client-id
   VITE_API_IDENTIFIER=your-api-identifier
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

## Project Structure

- **Frontend**: Located in the `taking-note` directory

  - **Main entry point**: `src/main.jsx` (startLine: 1, endLine: 28)
  - **Components**: `src/components`
  - **Pages**: `src/pages`
  - **Hooks**: `src/hooks`
  - **Styles**: `src/index.css` (startLine: 1, endLine: 3)
  - **Configuration**: `vite.config.js` (startLine: 1, endLine: 13), `tailwind.config.js` (startLine: 1, endLine: 16), `postcss.config.js` (startLine: 1, endLine: 6), `eslint.config.js` (startLine: 1, endLine: 38)

- **Backend**: Located in the `dream-server` directory
  - **Main entry point**: `yogaServer.js` (startLine: 1, endLine: 313)
  - **Prisma schema**: `prisma/schema.prisma` (startLine: 1, endLine: 31)
  - **Migrations**: `prisma/migrations`

## Scripts

- **Development**: `npm run dev` (startLine: 6, endLine: 10 in `taking-note/package.json`)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Preview**: `npm run preview`

## GraphQL API

The backend uses GraphQL Yoga to provide a GraphQL API. The schema and resolvers are defined in `yogaServer.js` (startLine: 82, endLine: 265).

## Authentication

Authentication is handled using Auth0. The Auth0Provider is set up in `src/main.jsx` (startLine: 12, endLine: 26).

## Themes

Themes are managed using DaisyUI and can be selected using the `SelectorTheme` component. The available themes are defined in `src/utils.js` (startLine: 1, endLine: 31).

## License

This project is licensed under the MIT License.
