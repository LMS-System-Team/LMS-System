# LMS-System

Learning Management System built with Laravel, Inertia, React, TypeScript, Vite, and Tailwind CSS.

## Requirements

Install these before starting:

- PHP 8.3 or newer
- Composer 2
- Node.js 22 and npm
- Git
- SQLite, MySQL, or another database supported by Laravel

This project resolves Composer dependencies against PHP 8.3 so the GitHub Actions test matrix stays compatible with PHP 8.3, 8.4, and 8.5.

## Clone The Project

```bash
git clone https://github.com/Ing-Vanly/LMS-System.git
cd LMS-System
```

## Install Dependencies

```bash
composer install
npm install
```

## Environment Setup

Create your local environment file:

```bash
cp .env.example .env
php artisan key:generate
```

The default `.env.example` uses SQLite. Create the SQLite database file before running migrations:

```bash
php artisan migrate
```

If you want to use MySQL instead, update these values in `.env` before running `php artisan migrate`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lms_system
DB_USERNAME=root
DB_PASSWORD=
```

## Run Locally

Start the Laravel server, queue listener, and Vite dev server:

```bash
composer run dev
```

Then open the app in your browser:

```text
http://127.0.0.1:8000
```

If you use Laravel Herd or Valet and your `.env` has `APP_URL=http://lms-system.test`, open this URL instead:

```text
http://lms-system.test
```

## GitHub Actions

GitHub runs two workflows on push and pull request:

- `linter`: PHP formatting, frontend formatting, and frontend linting
- `tests`: build, PHPStan, and Laravel tests across PHP 8.3, 8.4, and 8.5

Make sure `composer ci:check` passes locally before opening a pull request or pushing to shared branches.
