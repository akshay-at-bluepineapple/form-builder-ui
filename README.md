# 🧱 Form Builder UI

A dynamic, drag-and-drop form builder built with **React**, **Vite**, and **Hero UI** components. Designed for rapid UI prototyping and intuitive form section management.

---

## 🚀 Features

- ⚛️ **React + Vite** – Fast, modern development stack
- 🎨 **Hero UI + Tailwind CSS** – Clean, customizable components
- 🧲 **Drag and Drop Toolbox** – Easily build complex forms
- ♻️ **HMR (Hot Module Replacement)** – Instant updates during development
- 🧹 **ESLint Preconfigured** – Clean, consistent code

---

## 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/form-builder-ui.git
   cd form-builder-ui
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

---

## 🛠️ Usage

### 🧰 Toolbox

The toolbox contains form field types like:

- Label
- Text Input
- Checkbox
- Date Picker

Drag these into your form canvas (feature WIP or customizable per logic).

### ➕ Add Section

Click “+ Add Section” to create a new form section dynamically.

---

## 🎨 Tailwind CSS Setup

Hero UI depends on Tailwind CSS. Make sure the following is in your `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

And import this in `main.jsx`:

```js
import './index.css';
```

If Tailwind isn’t yet installed:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

## 🧹 Linting

This project includes a basic ESLint setup. For production-ready apps:

- Add TypeScript
- Enable type-aware rules with [`typescript-eslint`](https://typescript-eslint.io)
- Use Prettier for formatting

---

## 🔌 Plugins

Supports both official Vite React plugins:

- [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react) – uses Babel
- [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react-swc) – uses SWC

Choose either based on performance preferences.

---

## 📁 Project Structure

```
form-builder-ui/
├── src/
│   ├── components/
│   │   └── Toolbox.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 📝 License

MIT © [Your Name](https://github.com/your-username)

---

## 💡 Credits

Built using:

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Hero UI](https://heroui.dev/)
