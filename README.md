# <img width="32px" src="./public/images/wifi.png"> WiFi Card Generator (Docker version)


This is a fork of [bndw/wifi-card](https://github.com/bndw/wifi-card) project.


## Introduction [中文](https://github.com/Jackie264/wificard-docker/blob/master/README_CN.md)
This project is a tool for generating Wi-Fi connection QR codes, making it easy to share Wi-Fi credentials.

---

## **Major Updates and Tech Stack Upgrade**

In recent development iterations, I have comprehensively upgraded and optimized the project's underlying tech stack and build/deployment processes. The aim is to enhance development efficiency, build speed, and deployment stability and security.

**Key highlights include:**

1.  **Migration from Create React App (CRA) to Vite:**
    * **Reason:** The `create-react-app` project has entered maintenance mode with reduced active development. To embrace more modern frontend build tools and gain faster development experience and production build speeds, I opted to migrate to Vite.
    * **Improvements:** Vite offers incredibly fast development server startup and Hot Module Replacement (HMR), significantly boosting development efficiency. Its ES Modules-based build approach also leads to more efficient production bundling.
    * **Implementation:** Detailed adjustments were made to dependencies and scripts in `package.json`, `vite.config.mjs` was introduced for Vite-specific configurations, and `index.html` was updated to accommodate Vite's entry file loading mechanism.

2.  **Optimized Dockerized Build and Deployment Process:**
    * **Goal:** To containerize the project, ensuring consistency across development, testing, and production environments, and simplifying the deployment process.
    * **Improvements:** A robust `Dockerfile` was written to build the React application into a lightweight Docker image. This `Dockerfile` incorporates multi-stage builds, separating the application build from the final runtime environment, thereby reducing image size and enhancing security.
    * **Key Optimizations:**
        * Resolved conflicts with the `husky` tool in the Docker build environment by completely removing unnecessary Git Hooks dependencies, ensuring a clean build process.
        * Addressed the `vite` command not found issue during Docker builds by optimizing `yarn install` behavior and ensuring correct `$PATH` configuration, allowing the `vite build` command to execute successfully.
        * Renamed `vite.config.js` to `vite.config.mjs` to align with Vite's official recommended ES Modules best practices, eliminating related build warnings.

3.  **Dependency Security and Version Management (Dependabot Integration):**
    * **Goal:** To continuously monitor and manage security vulnerabilities and version updates in project dependencies, ensuring the project always uses the latest and most secure libraries.
    * **Improvements:** Integrated GitHub Dependabot. By configuring the `.github/dependabot.yml` file, Dependabot automatically scans `package.json` and `yarn.lock` files, checking weekly for all `npm` ecosystem dependency updates and security vulnerabilities.
    * **Problem Resolution:** Successfully addressed the ReDoS vulnerability in the `semver` library and `postcss` compatibility issues by using `overrides` in `package.json` to enforce secure dependency versions.

---

## **How to Use/Run**

The project is currently deployed automatically via Docker images. If you wish to run or test it locally, please follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [Your Repository URL]
    cd [Your Repository Name]
    ```
2.  **Build the Docker image:**
    ```bash
    docker build -t wifi-card-app .
    ```
3.  **Run the Docker container:**
    ```bash
    docker run -p 80:80 wifi-card-app
    ```
4.  **Access the application:** Visit `http://localhost` in your browser.

---

## **Contributing and Feedback**

Contributions of all forms are welcome! If you have any questions, suggestions, or find a bug, please feel free to submit an Issue or a Pull Request.

---

## **License**

[MIT License]
