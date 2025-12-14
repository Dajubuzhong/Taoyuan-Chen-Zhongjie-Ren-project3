# Sudoku App – Project 3

Video Demo: https://drive.google.com/file/d/1pUWsR4JWMJfRc6SebhZq3fC91QeMKZX4/view?usp=sharing


## Pages

1. Home Home Page (/)
2. Selection Page (/games)
3. Game Page (/game/{gameid})
4. Rules Page (/rules)
5. High Score Page (/scores)
6. Login Page (/login)
7. Register Page (/register)


## Authors

This README and the Sudoku project were collaboratively created by:
· Taoyuan Chen (https://github.com/Dajubuzhong)
· Zhongjie Ren (https://github.com/LorenzZR)


# Assignment Writeup

## What were some challenges you faced while making this app?

One big challenge in this project was implementing cookie-based authentication so users could browse the site while logged out but still be restricted from interacting with games. Managing game state across the backend and frontend also required careful coordination. In addition, keeping the code clean and modular with multiple pages, components, and APIs took deliberate planning and refactoring.

## Given more time, what additional features, functional or design changes would you make?

Given more time, we'd add user profile pages showing personal stats like total wins and solve times. we'd also create a built-in timer to support speed-based leaderboards. Finally, expanding the difficulty levels or allowing community-created puzzles would significantly increase replay value.

## What assumptions did you make while working on this assignment?

We assumed that users can always browse every page even when logged out but cannot interact with the board without authentication. We also assumed that each username must be unique and that a successful login always returns a valid cookie. For simplicity, we treated “completing a game” as the only scoring metric, rather than tracking speed or hints used.

## How long did this assignment take to complete?

About 25-30 hours in total.

## What bonus points did you accomplish? Please link to code where relevant and add any required details.

We accomplished password encryption and the "Delete Game" feature. Passwords are hashed using bcrypt before being stored in MongoDB, which ensures that no plaintext passwords were stored in the database. The "Delete Game" feature removes the game from the system and updates the high scores.
