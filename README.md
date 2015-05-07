# puzzle
Given size N, randomly generate a sliding puzzle that can be solved by the user. Add hint button that will tell the user the next best step if they get stuck. If the user decides to give up, allow them to see the sequence of moves needed to solve the puzzle.

Puzzle1 is a first-stab at the concept, more about learning what works and what doesn't, and wrapping my head around the concepts involved. Uses Zurb Foundation (css only, mostly for grid concerns), jQuery, JavaScript home-grown plugin. I include at only to show the process. 

Puzzle2 takes the results of the first-stab and builds the puzzle a better way. Stripped out Foundation, uses jQuery, wrote different plugin, used fun Etsy dog painting... Implements move counter, shuffles the tiles properly, checks for solvability, etc.

Of note, what I was not able to complete for this project is the implementation of the path-finding algorithm for helping the user get a hint or solution. I ran out of time, yet I know the path I would take for implementing that (async call to server-side, where algorithm (IDA*) would find the path, returning to client). Please see copious comments in puzzle2/scripts/puzzle2.js.
