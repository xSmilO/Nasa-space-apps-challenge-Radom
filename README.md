Project Name:
What if it hits?

Summary:
What If It Hits? is an interactive 3D web app that simulates asteroid impacts on Earth using real NASA Near-Earth Object (NEO) data. Users can select any asteroid from NASA’s database or create their own, launch it toward Earth, and visualize the explosion, shockwave, fireball, and crater. The app calculates real-time statistics such as population affected, economic losses, energy released in TNT megatons, and environmental consequences.

Beyond individual impacts, users can explore all known asteroids in real-time 3D within a Solar System view or focus on localized effects with Earth-only mode. The app includes gamification elements like missions, points, and rankings to make learning engaging, as well as “Defense Mode,” where users test real asteroid deflection strategies. Accessibility features ensure inclusivity across devices and user abilities.

By combining scientific accuracy, interactive visualization, and educational tools, What If It Hits? addresses the NASA Space Apps challenge by fostering public understanding of asteroid threats and planetary defense. It is important because it transforms abstract space science into an intuitive, engaging, and empowering experience that inspires curiosity, learning, and preparedness.

Project Demonstration:
[text](https://www.canva.com/design/DAG01yOf9Yg/LkjMPz8__EZ4ZPGFKgJJdw/view?utm_content=DAG01yOf9Yg&amp;utm_campaign=designshare&amp;utm_medium=link2&amp;utm_source=uniquelinks&amp;utlId=h93b6a9ca82)

Project Details:
How does it work?
What If It Hits? uses real data from NASA’s Near-Earth Object (NEO) database, which is converted into local .json files containing orbital elements and physical parameters of each asteroid. This data is used to calculate the positions, trajectories with Keplerian formulas, and potential impact effects of asteroids.

To render the interactive 3D simulations, we used Three.js, one of the most popular libraries for 3D graphics with a friendly API. The user interface is built with HTML and CSS to display controls, sliders, buttons, and informational panels. Additional libraries like Turf and MapLibreGL are used for geospatial calculations and map visualization, while Node and Vercel handle backend logic and deployment.


What exactly does it do?
The app is an interactive 3D asteroid impact simulator. Users can select any asteroid from NASA’s NEO database or define their own asteroid parameters (size, speed, trajectory) to simulate impacts on Earth. Once launched, a realistic animation visualizes the explosion, shockwave, crater, and fireball, while the AI Expert module provides a short conclusion summarizing affected populations, economic losses, energy released, and environmental consequences.
The app features two main views:
Earth View: Focused on local impacts, showing regional consequences.
Solar System View: Displays real-time positions of all known asteroids, NEOs, and PHAs.
Additional functionality includes:
A time slider to explore past and future trajectories.
A Defence Mode to test asteroid deflection strategies.
Interactive UI elements like mission trackers, rankings, and badges for gamification.
What benefits does it have?
Education: Simplifies complex astrophysics, teaching users about asteroid science, planetary defense, and orbital mechanics.
Awareness: Demonstrates the potential hazards of asteroid impacts in a visually intuitive way.
Motivation: Gamification encourages exploration and learning through missions, points, and rankings.
Accessibility: Designed for all users with colorblind-friendly visuals, screen reader support, and simplified educational modes.
AI Insights: The AI Expert summarizes simulations for quick understanding.
Cross-platform compatibility: Works seamlessly on phones, tablets, and PCs.
What do you hope to achieve?
We aim to educate, inform, and inspire. By providing interactive simulations and AI-powered insights, the app raises awareness of potential asteroid hazards while teaching planetary science in an engaging way.
On a global scale, timely warnings and simulations could help inform decision-making, while on an educational level, the app encourages curiosity about space among children, students, and space enthusiasts.

What tools, coding languages, hardware, or software did you use to develop your project?
Languages & Frameworks: TypeScript, HTML, CSS
3D & Mapping Libraries: Three.js, Turf, MapLibreGL
Development & Deployment: Vite, Node.js, Vercel


Use of Artificial Intelligence (AI):
We used AI in two ways:
Mistral AI — to generate short, informative conclusions after each asteroid impact simulation, summarizing effects such as population affected, economic losses, energy released, and environmental consequences.
Canva AI Image Generation — to create illustrations and visuals for the presentation slides.
