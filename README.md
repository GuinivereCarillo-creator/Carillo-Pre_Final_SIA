# Tasty Burger

Burger shop web app built with React, TypeScript, Vite and Tailwind CSS.

## Run

```bash
npm install
npm run dev      # development server
npm run build    # production build in dist/
npm run preview  # serve the production build
npm run lint     # eslint
```

## Stack

- React 19 with TypeScript
- Vite 7 with the Tailwind CSS v4 plugin
- Tailwind utility classes for every screen, with theme tokens in `src/index.css`
- ESLint flat config for TypeScript, React hooks and React refresh

## Pages

- Our Menu - four burgers per row, first four shown, View More / Show Less
- Feature - featured burgers, each one opens its own page in a new tab
- About - story, statistics and contact details
- Shop - order list with quantity controls, total and checkout
- Contact - message form with validation

## Menu features

- Sort by date added, price, name, stock or rating
- Stock per burger with a Low stock badge when the count is 5 or below
- Star button on every card to add or remove it from the Feature page
- Add Burger button at the bottom right opens a form over a blurred page.
  The form takes a photo upload, name, description, price in pesos, stock,
  rating and a Feature checkbox. The new burger appears in the menu right away
  and is followed by a highlight, together with a confirmation message.
- Burgers and the cart are stored in the browser localStorage, so a
  reload keeps everything in place.

## Structure

```
src/
  App.tsx                  menu, feature, about, shop and contact screens
  components/
    AddBurgerSheet.tsx     new burger form with photo upload
    ProductPage.tsx        standalone page for a single burger
    Stars.tsx              rating stars
  data.ts                  sample burgers and sorting
  format.ts                peso currency, dates, stock rule
  styles.ts                shared Tailwind class strings
  readImage.ts             photo resize before saving
  types.ts                 shared types
  index.css                Tailwind import and theme tokens
```

Sample burgers: Crispy Chicken, Ultimate Bacon, Black Sheep, Vegan Burger,
Double Trouble, Cheese Overload, Spicy Inferno, Classic Beef.
