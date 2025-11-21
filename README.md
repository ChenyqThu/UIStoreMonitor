# UniFi Store Monitor

A real-time dashboard for tracking Ubiquiti product stock and prices, built with React, Vite, and Supabase.

## Features

*   **Real-time Tracking**: Monitors product availability and price changes.
*   **Supabase Integration**: Stores data persistently in a Supabase database.
*   **Automated Crawler**: Includes a script to fetch data from the Ubiquiti store API.
*   **Daily Updates**: Configured with GitHub Actions to run the crawler daily at 3:00 AM UTC.
*   **Responsive Dashboard**: Clean, sortable, and filterable UI with persistent column resizing.

## Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, Lucide React
*   **Backend/Database**: Supabase (PostgreSQL)
*   **Crawler**: Node.js, TypeScript

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   Supabase Account

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/ChenyqThu/UIStoreMonitor.git
    cd UIStoreMonitor
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_KEY=your_supabase_anon_key
    ```

4.  Initialize Database:
    Run the SQL commands in `supabase_schema.sql` in your Supabase SQL Editor.

### Running Locally

1.  **Start the Dashboard**:
    ```bash
    npm run dev
    ```

2.  **Run the Crawler** (to populate data):
    ```bash
    npx tsx scripts/crawler.ts
    ```

## Deployment

### Vercel

This project is optimized for deployment on Vercel.
1.  Import the repository to Vercel.
2.  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` to Vercel Environment Variables.
3.  Deploy!

### GitHub Actions (Crawler)

To enable the daily crawler:
1.  Go to Repository Settings -> Secrets and variables -> Actions.
2.  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` as repository secrets.
