/**
 * @type {import('tailwindcss').Config}
 *
 * This project uses Tailwind v3. In the v3 migration the `purge` key was
 * renamed to `content`, and JIT mode became the default. The configuration
 * below already reflects those changes.  If you ever upgrade from v2 be sure
 * to review the official migration guide:
 * https://tailwindcss.com/docs/upgrade-guide
 */
module.exports = {
  // The paths to all of the template files in your project.  Tailwind will
  // scan these for class names; if you forget to include a file the styles
  // contained within it will be purged in production builds.  This is a common
  // source of "styles not applying" issues.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
