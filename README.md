# AH Zubayer - Portfolio (Cloudflare Pages + D1, 100% free)

Pages: Home (with About), Portfolio, Services, Blog, Website Audit, Contact, plus /admin/.
Backend: Cloudflare Pages Functions + D1 database (visitor tracking, messages, blog posts, audit log).

## Deploy (about 10 minutes)
You need Node.js installed and a free Cloudflare account.

1. Open a terminal in this folder and run:
   npm i -g wrangler
   wrangler login
2. Create the database:
   wrangler d1 create ah-zubayer-db
   Copy the `database_id` it prints into wrangler.toml (replace PASTE_YOUR_D1_ID_HERE).
3. Create the tables:
   wrangler d1 execute ah-zubayer-db --remote --file=schema.sql
4. Create the project and deploy:
   wrangler pages project create ah-zubayer --production-branch main
   wrangler pages deploy public --project-name ah-zubayer
5. Set your admin password (secret):
   wrangler pages secret put ADMIN_PASSWORD --project-name ah-zubayer
   Then deploy again: wrangler pages deploy public --project-name ah-zubayer
6. Open https://ah-zubayer.pages.dev and https://ah-zubayer.pages.dev/admin/

Custom domain: Cloudflare dashboard > Workers & Pages > ah-zubayer > Custom domains.
(Dashboard drag-and-drop upload does NOT run the /functions folder, so use wrangler or connect a GitHub repo.)

## Edit your content
- Name, text, projects: edit the HTML files in /public.
- Colors: top of public/css/style.css (--ac is the green accent).
- Blog posts: write them in /admin/.
- Contact email: footer text in public/js/app.js and contact.html.

## Notes
- Tracking stores a random visitor ID, page, country, city, device, browser, source and time on page. IP addresses are stored only as a short one-way hash. Add a privacy note to your site.
- Free limits (D1 and Pages Functions) are enough for a portfolio. Check Cloudflare's current limits if traffic grows.
