/**
 * @typedef  {function(StringPosition): boolean} BruteForce :
 * 
 *                         A function that takes information about the current
 *                         position of the single-quote in the original string
 *                         the parser found. And returns a boolean determining
 *                         whether the parser will use `O(2^n)` time-complexity
 *                         brute-force parsing.
 * 
 * @typedef  {function(StringPosition): EuristicResult} Euristic :
 * 
 *                         A function that takes information about the current
 *                         position of the single-quote in the original string
 *                         the parser found. Does its own eurithmic logic to
 *                         determine whether the single-quote needs to
 *                         changed. And returns an object representing if the
 *                         single-quote was meant to be a double-quote JSON
 *                         string delimiter, and what quote to use in its
 *                         place. This allows more complex logic (example:
 *                         situations where the single-quote (`'`) needs to be
 *                         replaced by an escaped double-quote (`\\"`)).
 * 
 * @typedef  {("\""|"\'")} Quote :
 * 
 *                         One single-quote (`'`) or double-quote (`""`)
 *                         string character.
 *
 * @typedef  {("\\\""|"\\'")} EscapedQuote :
 * 
 *                         One single-quote (`\\'`) or double-quote (`\\"`)
 *                         string character, preceeded by a reverse solidus
 *                         (`\`), to escape it from the usual JSON
 *                         interpretation.
 *
 * @typedef  {Object}      StringPosition :
 * 
 *                         An object containing information on where in a
 *                         string a single-quote character was found by the
 *                         parser.
 * 
 * @property {Number}      StringPosition.index :
 * 
 *                         The index of the single-quote in the original
 *                         string the parser is currently trying to correct.
 * 
 * @property {Number}      StringPosition.character :
 * 
 *                         The UTF-32 character pseudo-index (`index -
 *                         (UFT-16 surrogate pairs / 2)`) of the single-quote
 *                         in the original string the parser is currently
 *                         trying to correct.
 * 
 * @property {String}      StringPosition.followingString :
 * 
 *                         The substring after the single-quote.
 * 
 * @property {String}      StringPosition.preceedingString :
 * 
 *                         The substring of the _original_ string before the
 *                         single-quote.
 * 
 * @property {Boolean}     StringPosition.isString :
 * 
 *                         The internal flag for `preParse` that determines
 *                         whether the algorithm interpretes parsing as
 *                         parsing the middle of a JSON string.
 *
 * @typedef  {Object}      EuristicResult :
 * 
 *                         An object representing if the single-quote was
 *                         meant to be a double-quote JSON string delimiter,
 *                         and what quote to use in its place.
 * 
 * @property {Boolean}     EuristicResult.isString :
 * 
 *                         
 * 
 * @property {Quote|EscapedQuote} EuristicResult.quote :
 * 
 *                         The correct quote to use at that position in the
 *                         JSON string. Possibly: `'`, `"`, `\\'`, or `\\""`.
 *                         Please note, this can change the legnth of the
 *                         corrected string relative to the length of the
 *                         original string, and can replace the single-quote
 *                         with _any_ string! Though this is likely to
 *                         **never** be necessary, it is still possible, (but
 *                         _**not**_ recommended).
 */

/**
 * @description            Reformats a misformatted JSON string to valid JSON.
 *
 *                         **NOTE:** This function assumes that all
 *                         double-quotes are escaped correctly, like: `\"`.
 * 
 *                         If there are improperly escaped double-quotes, this
 *                         function will not be able to reformat the
 *                         misformatted JSON properly, unless custom logic in
 *                         an `opts.euristic` function is used.
 *
 *                         **NOTE:** this is _**NOT**_ designed for
 *                         performance or large JSON strings. This can have
 *                         `O(2^n)` time-complexity!
 *
 * @param    {String}      misformattedJSON :
 * 
 *                         The string that is invalidly formatted for JSON by
 *                         using single-quotes (`'`) instead of double-qutoes
 *                         (`"`) to delimit string vaules and object
 *                         identifiers.
 * 
 * @param    {Object}      opts :
 * 
 *                         An object for options to: use brute-force parsing,
 *                         use a euristic single-quote replacement function,
 *                         give a preset array of possibly valid JSON strings
 *                         to attempt to parse as a solution to the
 *                         `preParse(misformattedJSON)` parsing algorithm.
 * 
 *                         Also extra internal flags and recurrsion options
 *                         to: preset the parsed JSON string used by the
 *                         algorithm, set the current string index in the
 *                         original string given to the root (non-recursive)
 *                         call to `preParse(misformattedJSON)`, set the
 *                         UTF-32 character pseudo-index
 *                         (`index - (UFT-16 surrogate pairs / 2)`)
 *                         in the original string given to the root
 *                         (non-recursive) call to
 *                         `preParse(misformattedJSON)`, send the original
 *                         string given to the root (non-recursive) call to
 *                         `preParse(misformattedJSON)` to recursive calls of
 *                         `preParse`, set the flag that determines whether
 *                         the `preParse` function is being called
 *                         recursively, and to set the flag that determines
 *                         whether the calling `preParse` function was parsing
 *                         mid-string and set the same parsing state in the
 *                         recursive call to `preParse`.
 * 
 * @param    {Euristic}    [opts.euristic] :
 * 
 *                         A function that takes information about the current
 *                         position of the single-quote in the original string
 *                         the parser found. Does its own eurithmic logic to
 *                         determine whether the single-quote needs to
 *                         changed. And returns an object representing if the
 *                         single-quote was meant to be a double-quote JSON
 *                         string delimiter, and what quote to use in its
 *                         place. This allows more complex logic (example:
 *                         situations where the single-quote (`'`) needs to be
 *                         replaced by an escaped double-quote (`\\"`)).
 * 
 * @param    {BruteForce}  [opts.bruteForce] :
 * 
 *                         A function that takes information about the current
 *                         position of the single-quote in the original string
 *                         the parser found. And returns a boolean determining
 *                         whether the parser will use `O(2^n)` time-complexity
 *                         brute-force parsing.
 * 
 * Internal args:
 * 
 * @param    {String[]}     [opts.guesses=[]] :
 * 
 *                          Array to store all of the parser's possible
 *                          solutions. Holds strings of the parser guesses.
 *                          Used when strings are ambiguous because of
 *                          incorrect formating, and brute-forcing. Is
 *                          appended to by recursive calls to `preParse`.
 * 
 * @param    {String}       [opts.currentGuess=""] :
 * 
 *                          Parsers's guess of how to refomat JSON string. For
 *                          recursive calls to `preParse`, it is set the the
 *                          previously parsed guess, with future parser
 *                          guesses appended to it. Internally initializes
 *                          string to current guess for recursive calls to
 *                          `preParse`.
 * 
 * @param    {Number}       [opts.UTFStringIndex=0] :
 * 
 *                          Current index in original string.
 * 
 * @param    {Number}       [opts.UTFStringCodePoint=0] :
 * 
 *                          The UTF-32 character pseudo-index
 *                          (`index - (UFT-16 surrogate pairs / 2)`) in the
 *                          original string.
 * 
 * @param    {String}       [opts.originalString=misformattedJSON] :
 * 
 *                          String given root (non-recursive) function call to
 *                          `preParse(misformattedJSON)`.
 * 
 * @param    {Boolean}      [opts.recursing] :
 * 
 *                          The flag that determines whether the `preParse`
 *                          function is being called recursively. Internally
 *                          called to manage parser state to tell when to
 *                          return final results instead of exiting.
 * 
 * @param    {Boolean}      [opts.isString=false] :
 * 
 *                          The internal flag for `preParse` that determines
 *                          whether the algorithm winterpretesparsing as
 *                          parsing the middle of a JSON string.
 * 
 * @returns  {String|String[]|undefined} :     
 * 
 *                          The reformatted string, or array of reformatted
 *                          strings, if there was no error in parsing.
 */
function preParse(misformattedJSON, opts = {}) {
  // set internal default options passed to recursive calls

  // only set to original string from root call
  opts.originalString = opts.originalString ?? misformattedJSON
  // only set to default empty array in root call
  opts.guesses = opts.guesses ?? []
  // set to starting string index, `0`, from root call
  opts.UTFStringIndex = opts.UTFStringIndex ?? 0
  // set to starting character index, `0`, from root call
  opts.UTFStringCodePoint = opts.UTFStringCodePoint ?? 0

  let {
    // for root call, initialize to empty string
    currentGuess: currentGuess = "",
    recursing = !!opts.recursing,
    guesses,
    isString = !!opts.isString,
    bruteForce,
    euristic
  } = opts

  // MUST BE AFTER `opts` OBJECT DESTRUCTURING VARIABLE ASSIGNMENT
  // only set for recusive calls
  opts.recursing = opts.recursing ?? true

  /**
   * Fixed-width array to index each UTF-32 character.
   *
   * JavaScript strings are indexed by UTF-16 code units,
   * which are 2 bytes (16 bits) in length,
   * a single UTF-32 character is 4 bytes (32 bits),
   * the same as a complete UTF-16 surrogate pair,
   * (which is two UTF-16 code units).
   *
   * @type {String[]}
   */
  let fixedWidthCharacterArray = []

  // iteration over each UTF-32 code point
  for (const UTF16CodePoint of misformattedJSON)
    fixedWidthCharacterArray.push(UTF16CodePoint)

  /** String index (UTF-16 code unit) in current substring. */
  let UTFSubstringIndex = 0

  // loop over UTF-32 characters
  for (let i = 0; i < fixedWidthCharacterArray.length; i++) {
    /** Current UTF-32 code point in character array. */
    const UTFChar = fixedWidthCharacterArray[i]

    // increment string index by UTF-16 code units
    opts.UTFStringIndex += UTFChar.length
    UTFSubstringIndex += UTFChar.length

    // increment number of UTF-32 code points
    opts.UTFStringCodePoint++

    // only care about misformatted single-quotes
    if (UTFChar !== "'") {
      // keep character
      currentGuess += UTFChar

      // parse next characeter
      continue
    }

    /** The substring of `misformattedJSON` after the single-quote. */
    const followingString = misformattedJSON.slice(UTFSubstringIndex)

    /** The _original_ string before the single-quote. */
    const preceedingString = opts.originalString.slice(0, opts.UTFStringIndex)

    // try all possible solutions by recursing to try to generate a working solution by brute-force
    if (
      bruteForce?.({
        followingString,
        preceedingString,
        index: opts.UTFStringIndex,
        character: opts.UTFStringCodePoint,
        isString
      })
    ) {
      preParse(followingString, {
        // copy all other args, including the `guesses` array
        ...opts,
        // try to make a valid JSON string by keeping this single-quote a single-quote, the other iteration did the opposite, this way it checks all possibilities
        currentGuess: `${currentGuess}${UTFChar}`,
        // this could be changed to utilise some kind of optimization
        isString
      })

      // try to make a valid JSON string by replacing this single-quote with a double-quote, the other iteration did the opposite, this way it checks all psooibilities
      // if (isString) currentGuess.string += '"'
      currentGuess += '"'

      // delimit the string here, while the recursive iteration keep it as a string
      // this could be changed to utilise some kind of optimization
      isString = true

      // don't try to use euristics
      continue
    }

    // use user given euristics for for how to replace single-quote.
    if (typeof euristic === "function") {
      const euristicResult = euristic({
        followingString,
        preceedingString,
        index: opts.UTFStringIndex,
        character: opts.UTFStringCodePoint,
        isString
      })

      isString = euristicResult.isString
      currentGuess += euristicResult.quote

      // user defined euristic was used
      continue
    }

    // use default euristics
    if (isString) {
      /** The single-quote is followed by a JSON object, indetifier, value, or array delimiter */
      const euristicDelimiterFollowing = /^\s*[,:\]}]/.test(followingString)
      
      /** Counts every possible delimiter */
      const delimitersAfter = followingString.match(/[^,:\]}]*[,:\]}]/g)?.length ?? 0

      /** Counts every single-quote. */
      const quotesAfter = followingString.match(/[^']*'/g)?.length ?? 0
      
      /**
       * If there are an even number of single-quotes following this one, it's likely a misformatted string delimiter.
       */
      const euristicIncompleteStringAfter = quotesAfter % 2 === 0

      // likely the end of a JSON string
      // so replace single-quote with double-quote
      if (
        (delimitersAfter % 2 === 1 && euristicDelimiterFollowing) ||
        (euristicDelimiterFollowing && euristicIncompleteStringAfter) ||
        !quotesAfter
      ) {
        isString = false
        currentGuess += '"'

        continue
      }

      console.log(
        "Did not pass euristic test:",
        UTFChar,
        "at index:",
        opts.UTFStringIndex,
        "at character:",
        opts.UTFStringCodePoint,
        "previous substring"
      )

      // didn't pass euristics
      // add character to parsed string
      currentGuess += UTFChar

      continue
    }

    // beginning of a JSON string, reformat single-quote

    // parser now looking for ending single-quote that needs reformatting
    isString = true

    // replace single-quote with double-quote
    currentGuess += '"'
  }

  // track parser decision path
  guesses.push(currentGuess)

  // try all parsing guesses to see if one works
  if (!recursing) {
    /** Index of guess for debugging information. */
    let i = 0

    // tracks what part of the string was correctly parsed
    /** @type {String[]} */
    const successes = []

    for (const guess of guesses) {
      console.log(`parser guess #${i}: `, guess)

      try {
        JSON.parse(guess)

        // it parsed!
        successes.push(guess)

        console.log(`successfully parsed #${i}:`, guess, successes)
      } catch (error) {
        // catch JSON parsing error
        // output for user to debug
        console.log(i, guess, error)
      }

      i++
    }

    if (successes.length === 1) {
      console.log("Parser found definitive answer! parsed:", successes[0])

      return successes[0]
    }
    if (successes.length > 1) {
      console.log(
        "Try setting `opts.euristic` or `opts.problemAreas`, they can get better parsing! parsed:",
        successes
      )

      return successes
    }

    console.error(
      "Parser Failed to parse working JSON string, guesses:",
      guesses
    )

    console.error(
      "Try setting `opts.euristic` or `opts.bruteForce`, they can get better parsing!"
    )
  }
}

// const json1 = `['Bob O'Rielly']`
// const json2 = `['Mr. O'McDonald, height 13',1\\"']`
const json3 = `[{'name':'Bob O'Rielly','height':'13',5\\"'}]`
// const json4 = `[[''''''''''''],[[''''''''],'[]','{}',',',':'],'''''''''''''']`

// console.log(`ANSWERS 1:`, preParse(json1))
// console.log(`ANSWERS 2:`, preParse(json2))
console.log(`ANSWERS 3:`, preParse(json3))
// console.log(`ANSWER 4:`, preParse(json4))