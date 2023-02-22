# Running the app

This has been implemented with `create-react-app` and in a nvm enviroment using node `v19.6.1`, plenty of lower versions should work but that setup would guarantee everything works as expected.

Install the dependencies with:

```
npm install
```

Run the app with:

```
npm start
```

Run the tests with:

```
npm test
```

# Some caveats before the fake Pull Request

Due to the time limitations I needed to sacrifice putting some effort on several parts of the app where I can do far better. In order to prevent misunderstandings I will start with some of those caveats.

### CSS and general styling

I didn't put any effort thinking on a proper CSS strategy: preprocessors, file splitting, the app just gets cut out if the screen is not big enough or resized,I even ended coupling the CSS and the Cells.tsx component with magic numbers. Design-wise even though it ended up looking alright I still missed having the possibility to iterate more.

### File structure

I can spend hours thinking or discussing which file collocation strategies suit an app better or worse. In this case I completely skipped the I pretty much started a `create-react-app` and left it almost as found.

I even left some exploratory code in `/src/features/game` which now obviously doesn't even belong in the project but ended leaving there so you can browse it via your favorite means.

### Redux

I used Redux mostly because I have experience with it and tend to like it better than other state management solutions, not because I think this project requires it.
Now, this project needed some of the characteristics of tools that Redux provides like Immer for inmutability and Reselect for memoized selectors, so it saved me from adding them manually.

### Tests

The most important tests belong to the reducer where I focused all my efforts. The rest of the tests are valid but very incomplete, in some instances non-existing.

### Linting and Typescript

I have used a linter configured with my preffered settings but out of habit I found myself using some of the practices of my previous company which may have ended on some inconsistencies.
Similarly I configured Typescript in a forgiving way and probably missed some places that could have better settings.

# Fake Pull Request

## The core of the core

Before writing a single line of a React component I worked on a core algorithm capable to handle the game loop. This algorithm can be written in many ways and to keep it performant,maintanable and extensible I set myself a few extra goals:

- **Avoid `O(n^2*n-1)` slides with `n` being the grid side size**. The most straighfoward solution would consist on exploring the grid for cells (`O(n^2)`) and for each found cell look in the sliding direction for a place to move or merge to (`O(1)` to `O(n-1)`).
- **Decouple logic and animation.** Having the _main_ logic of the app coupled to things such as the DOM elements or the animations is the recipe for brittleness and poorly testable software. The most popular 2048 webApp does that and behaves erraticaly in several cases. I wanted to avoid that.
- **Increase affordance and avoid limiting possible animations.** As flawed as the 2048 webApp is, the animations included make clear how the cells move, merge and appear. Which in turn helps massively the player to understand and follow the game and from my point of view is a hard requirement for an MVP. It is very easy to write the core logic in a way that difficults or even requires big re-writes to implement said features, so I wanted something that makes them easy instead.

This first core algorithm can be found in `/src/features/game/trying_stuff.ts` and tested in `/src/features/game/trying_stuff.spec.ts`. The logic in both files was later on translated to a Redux slice and its utils.

The algorithm itself relies on 2 structures `cells` and `grid`.

`cells` is an array containing all the cells data in the view, which includes the ones that will be removed after their merging animation occurs. Their position data changing makes the animation possible. The cells marked as `merged` are used to prevent extra unexpected merges.

`grid` is a SIZExSIZE array that stores references to the cells and represents the actual current state of the game grid.

The sliding algorithm is the same for all the directions:

- We want to iterate over the grid starting from the border we are sliding to in a way that when we find a cell with a value we:
  1. If already in the border we are sliding towards, leave it there. But keep a reference to it in `lastMergeables` so that the following cell we find in the same axis of movement can use it instead of re-checking several positions.
  2. If there is no corresponding reference in `lastMergeables` move to the border and become the reference.
  3. If there is a mergeable reference in `lastMergeables` duplicate its value and mark it as `merged`, the current cell updates its position to that of the mergeable reference and is marked as `toRemove`
  4. If there is a non mergeable reference use it to calculate and update the position the cell should be moved to and make the cell become the new `lastMergeable` of the axis
- All this magic is achieved with the same loop for every direction by using a set of utils that allows to convert the `i, j` iterators in the correct `row, col` for the provided `direction` and `size`; and the correct border value (`borderIndex`) and `increment` needed to move cells close to each other.

![Visual example](https://user-images.githubusercontent.com/797738/220580183-7718cad9-6baa-458e-bc80-2b62487836b3.png)

## The full app

The rest is in a big percentage moving the previous logic to a reducer and its utils in `/src/features/game-grid/` with some minor tweaks _(for example, cells became an object with uuids and grid references those instead)_

The rest of the work was adding:

- Animations and transitions reliant on the apearance of new items, their row/col changing and their value changing.
- Some logic via the reducer `clean` attribute to allow the UI know when the shown cells need removing and request for it before the next interaction.
- Logic that allows the next interaction adding a new cell and cleaning the sliding ones.
- Logic to reset a game
- Listeners to play the game with the keyboard
- Memoized selectors to calculate available directions, and if the game has been won or lost
- Shadows showing available
