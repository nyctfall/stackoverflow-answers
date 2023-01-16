/**
 * @typedef  {function(StringPosition): boolean} BruteForce
 *                         A function that takes information about the current
 *                         position of the single-quote in the misformatted
 *                         string the parser found.
 *
 *                         And returns a boolean whether the parser will use
 *                         brute-force parsing, with time-complexity `O(2^n)`.
 *
 * @typedef  {function(StringPosition): Guess} Heuristic
 *                         A function that takes a reference the parser state
 *                         information, and modifies the parser guess state
 *                         using the given reference.
 *
 *                         This allows for much more complex logic.
 *
 *                         Example:
 *
 *                         Situations where the single-quote (`'`) needs to be
 *                         replaced by an escaped double-quote (`\\"`).
 *
 * @typedef  {("array"|"field"|"object-value"|"value")} JSONType
 *                         A string union type JSON types for arrays, object
 *                         fields, object values, and values.
 *
 * @typedef  {("\""|"\'")} Quote
 *                         One single-quote (`'`) or double-quote (`""`)
 *                         string character.
 *
 * @typedef  {("\\\""|"\\'")} EscapedQuote
 *                         One single-quote (`\\'`) or double-quote (`\\"`)
 *                         string character, preceded by a reverse solidus
 *                         (`\`), to escape it from the usual JSON
 *                         interpretation.
 *
 * @typedef  {Object}      StringPosition
 *                         An object containing information on where in a
 *                         string a single-quote character was found by the
 *                         parser.
 *
 * @property {Number}      StringPosition.stringIndex The index of the
 *                         single-quote in the misformatted string the parser
 *                         is currently trying to correct.
 *
 * @property {Number}      StringPosition.characterIndex The UTF-32 character
 *                         pseudo-index `index - (UFT-16 surrogate pairs /2)`
 *                         of the single-quote in the misformatted string the
 *                         parser is currently trying to correct.
 *
 * @property {String}      StringPosition.followingString The JSON substring
 *                         after the single-quote.
 *
 * @property {String}      StringPosition.precedingString The JSON substring
 *                         before the single-quote.
 *
 * @property {Guess}       StringPosition.currentGuess An object containing
 *                         information about a parser attempt to reformat a
 *                         JSON string. It contains a reformatted substring
 *                         the parser generated, and whether the internal
 *                         heuristics consider the substring to end in any
 *                         incompleted JSON type.
 *
 * @typedef  {Object}      Guess
 *                         An object containing information about a parser
 *                         attempt to reformat a JSON string. It contains a
 *                         reformatted substring the parser generated, and
 *                         whether the internal heuristics should consider the
 *                         substring to end in an incompleted JSON string.
 *
 * @property {String}      Guess.string The parser guess of how to reformat
 *                         JSON string. It is set to the previously parsed
 *                         guess, with future parser guesses appended to it.
 *
 * @property {Boolean}     Guess.isString The internal flag for `preParse`
 *                         that determines whether the algorithm interprets
 *                         current parsing as parsing the middle of a JSON
 *                         string value.
 *
 * @property {Boolean}     Guess.isEscaped The internal flag for `preParse`
 *                         that determines whether the algorithm interprets
 *                         current parsing as parsing a character escape
 *                         sequence in the middle of a JSON string value. It is
 *                         a number to accommodate unicode escape sequences.
 *
 *                         Only works for:  `\'`. not: `\"`, `\\`, `\/`, `\n`,
 *                         `\r`, `\b`, `\f`, `\t` or `\uXXXX`.
 *
 * @property {Boolean}     Guess.isObjectField The internal flag for
 *                         `preParse` that determines whether the algorithm
 *                         interprets the current parsing state as parsing
 *                         the middle of a JSON object value.
 *
 * @property {Boolean}     Guess.isObjectValue The internal flag for
 *                         `preParse` that determines whether the algorithm
 *                         interprets the current parsing state as parsing
 *                         the middle of a JSON object field.
 *
 * @property {Number}      Guess.isObject The internal flag for `preParse`
 *                         that determines whether the algorithm interprets
 *                         the current parsing state as parsing the middle of
 *                         a JSON object. It is a number to track how many
 *                         objects the single-quote is nested within.
 *
 * @property {Number}      Guess.isArray The internal flag for `preParse` that
 *                         determines whether the algorithm interprets the
 *                         current parsing state as parsing the middle of a
 *                         JSON array value. It is a number to track how many
 *                         arrays the single-quote is nested within.
 *
 * @property {Number}      Guess.aufoFilled The internal flag for `preParse`
 *                         that determines whether the algorithm already
 *                         reformatted this string index with a previous RegEx
 *                         heuristic solution. Is a string for how many future
 *                         indexes were prefilled. Default: `0`.
 *
 * @property {JSONType}    [Guess.isJSONType] The internal flag for `preParse`
 *                         that determines whether the algorithm interprets
 *                         the current parsing state as parsing the middle of
 *                         specific JSON type. It is a string union type for
 *                         arrays, object fields, object values, and values.
 *                         Used to keep track of the JSON type being parsed,
 *                         without including type nesting depth information.
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
 *                         an `opts.heuristic` function is used.
 *
 *                         **NOTE:** this is _**NOT**_ designed for
 *                         performance or large JSON strings. This can have
 *                         `O(2^n)` time-complexity!
 *
 * @param    {String}      misformattedJSON The string that is invalidly
 *                         formatted for JSON by using single-quotes (`'`)
 *                         instead of double-qutoes (`"`) to delimit string
 *                         values and object fields.
 *
 * @param    {Heuristic}   [heuristic] A function that takes a reference the
 *                         parser state information, and modifies the parser
 *                         guess state using the given reference. This allows
 *                         for much more complex logic.
 *
 *                         Example:
 *
 *                         Situations where the single-quote (`'`) needs to be
 *                         replaced by an escaped double-quote (`\\"`).
 *
 * @param    {BruteForce}  [bruteForce] A function that takes information
 *                         about the current position of the single-quote in
 *                         the misformatted string the parser found. And
 *                         returns a boolean whether the parser will use
 *                         brute-force parsing, with time-complexity `O(2^n)`.
 *
 * @param    {Boolean}     [TRY_HARD] A flag to brute-force with default,
 *                         heuristics, with time-complexity at around:
 *                         `O(2^n)`. Can be better than a `bruteForce`, but
 *                         still not reccommended, use `heuristic` if possible.
 *
 * @returns  {String[]}    The reformatted string, or array of reformatted
 *                         strings, if there was no error in parsing.
 */
 function preParse(misformattedJSON, bruteForce, heuristic, TRY_HARD) {
	/*
  if (TRY_HARD)
    console.warn(
      "THIS HAS O(2^n) TIME COMPLEXITY, MAKE SURE YOU KNOW WHAT YOU'RE DOING..."
    )
  */

	/**
	 * @type   {Guess[]}     Array to store all of the parser's possible
	 *                       solutions. Holds strings of the parser guesses.
	 *                       Used when strings are ambiguous because of
	 *                       incorrect formatting, and brute-forcing. Is
	 *                       appended to by recursive calls to `preParse`.
	 */
	let guesses = [
		{
			string: "",
			isString: false,
			isEscaped: false,
			isArray: 0,
			isObject: 0,
			isObjectField: false,
			isObjectValue: false,
			isJSONType: undefined,
			aufoFilled: 0
		}
	]

	/**
	 * @type   {String[]}    Fixed-width array to index each UTF-32 character.
	 *                       JavaScript strings are indexed by UTF-16 code units,
	 *                       which are 2 bytes (16 bits) in length, a single
	 *                       UTF-32 character is 4 bytes (32 bits), the same as
	 *                       a complete UTF-16 surrogate pair, (which is two
	 *                       UTF-16 code units).
	 */
	let fixedWidthCharacterArray = []

	// iteration over each UTF-32 code point to add to UTF-32 array
	for (const UTF16CodePoint of misformattedJSON)
		fixedWidthCharacterArray.push(UTF16CodePoint)

	// loop over UTF-32 characters
	for (
		let characterIndex = 0, stringIndex = 0;
		characterIndex < fixedWidthCharacterArray.length;
		stringIndex += fixedWidthCharacterArray[characterIndex].length,
			characterIndex++
	) {
		/**
		 * @type {String}      Current UTF-32 code point in character array.
		 */
		const character = fixedWidthCharacterArray[characterIndex]

		// loop over all guesses, and evaluate thier likelihood,
		// reversing over array to add or remove guesses
		// without changing the portion of the array being looped over
		for (let guessIndex = guesses.length - 1; guessIndex >= 0; guessIndex--) {
			/**
			 * @type {Guess}     Parsers's guess of how to reformat JSON string. It
			 *                   is set to the previous parser guess, with future
			 *                   parser guesses appended to it. It also includes
			 *                   state information used for the default heuristics.
			 */
			const currentGuess = guesses[guessIndex]

			// check guess auto-fill
			if (currentGuess.aufoFilled) {
				// decrement number of pre-parsed characters,
				// since one was just manually parsed
				currentGuess.aufoFilled--

				// guess already parsed this part of the string using a RegExp,
				// loop to next guess
				continue
			}

			const {
				isArray,
				isEscaped,
				isObject,
				isObjectField,
				isObjectValue,
				isString,
				isJSONType
			} = currentGuess

			/**
			 * @type {String}    The substring _after_ the single-quote.
			 */
			const followingString = misformattedJSON.slice(stringIndex + 1)

			/**
			 * @type {String}    The substring _before_ the single-quote.
			 */
			const precedingString = misformattedJSON.slice(0, stringIndex)

			// change parser state for delimiters
			if (character !== "'") {
				// keep character
				currentGuess.string += character

				// set escape sequence, only for inside of a JSON string
				if (isString) {
					// escape character found,
					// if another escape character preceded this one,
					// the following character is not part of an escape sequence
					// otherwise, the following character is part of an escape sequence
					if (character === "\\") currentGuess.isEscaped = !isEscaped

					// if isEscaped is false, loop to possible end of string
					// if isEscaped is true, ignore escaped single-quote character later
					// ignore delimiter characters inside of a JSON string,
					// since they do not overlap with escape sequence
					continue
				}

				// set if in an object field and increase object nesting
				if (character === "{") {
					// set if in an object field
					currentGuess.isObjectField = true
					currentGuess.isJSONType = "field"

					// increase object nesting
					currentGuess.isObject++
				}
				// unset in object field on delimiter and set in object value
				else if (character === ":") {
					// unset object field on delimiter
					currentGuess.isObjectField = false
					currentGuess.isJSONType = "object-value"

					// set in object value
					currentGuess.isObjectValue = true
				}
				// unset in object value on delimiter and decrease object nesting
				else if (character === "}") {
					// unset in object value on delimiter
					currentGuess.isObjectValue = false

					// decrease object nesting
					currentGuess.isObject--

					currentGuess.isJSONType =
						// if this is nested in a root object,
						!isArray && isObject
							? "object-value"
							: // if this is nested in a root array,
							!isObject && isArray
							? "array"
							: // default JSON value type
							isArray && isObject
							? "value"
							: // end of JSON
							  undefined
				}
				// increase array nesting
				else if (character === "[") {
					currentGuess.isArray++
					currentGuess.isJSONType = "array"
				}
				// decrease array nesting
				else if (character === "]") {
					currentGuess.isArray--

					currentGuess.isJSONType =
						// if this is nested in a root array,
						!isObject && isArray
							? "array"
							: // if this is nested in a root object,
							!isArray && isObject
							? "object-value"
							: // default JSON value type
							isArray && isObject
							? "value"
							: // end of JSON
							  undefined
				}
				// only for objects, not array in object, reset field and unset value
				else if (
					isObjectValue &&
					isJSONType === "object-value" &&
					character === ","
				) {
					// last value ended in last object entry
					currentGuess.isObjectValue = false

					// new field started in next object entry
					currentGuess.isObjectField = true
					currentGuess.isJSONType = "field"
				}

				// only attempt to reformat single-quotes
				continue
			}

			// try all possible solutions by generating
			// all possible solutions by brute-force
			if (
				bruteForce?.({
					// make copy to prevent mutations
					currentGuess: { ...currentGuess },
					followingString,
					precedingString,
					stringIndex,
					characterIndex
				})
			) {
				// create a new guess
				guesses.push({
					...currentGuess,
					// try to make a valid JSON string
					// by keeping this single-quote,
					string: currentGuess.string + character

					// // possibly change these to allow for different heuristics
					// isString: currentGuess.isString,
					// isEscaped: currentGuess.isEscaped,
					// isArray: currentGuess.isArray,
					// isObject: currentGuess.isObject
					// isObjectField: currentGuess.isObjectField,
					// isObjectValue: currentGuess.isObjectValue,
				})

				// try to make a valid JSON string
				// by replacing this single-quote with a double-quote
				//! must come after new guess creation
				currentGuess.string += '"'

				// // possibly change these to allow for different heuristics
				// currentGuess.isString = currentGuess.isString
				// currentGuess.isEscaped = currentGuess.isEscaped
				// currentGuess.isArray = currentGuess.isArray
				// currentGuess.isObject = currentGuess.isObject
				// currentGuess.isObjectField = currentGuess.isObjectField
				// currentGuess.isObjectValue = currentGuess.isObjectValue
			}
			// use user given heuristics for for how to replace single-quote,
			// or change guess parsing state
			else if (
				heuristic?.({
					// give current parser guess and state info to heuristic
					currentGuess,
					followingString,
					precedingString,
					stringIndex,
					characterIndex
				})
			) {
				/* do nothing... `heuristic` modified object reference directly */
			}
			// use default heuristics
			else if (isString) {
				// skip if quote is escaped and clearly inside of a string
				if (isEscaped) {
					// escape sequence finished
					currentGuess.isEscaped = false

					// add normal quote character back to string
					currentGuess.string += character

					// loop to next character
					continue
				}

				/**
				 * @type {String}   JSON object, value, or array ending delimiters.
				 */
				let possibleDelimiters = ""

				// add contextual delimiters for use in heuristics

				// delimiter for ending an array,
				if (isJSONType === "array") possibleDelimiters = ",\\]"
				// delimiter for ending an object,
				else if (isJSONType === "object-value") possibleDelimiters = ",}"
				// delimiter for ending an object field
				else if (isJSONType === "field" || isObjectField)
					possibleDelimiters = ":"
				// delimiter for ending a value
				else if (isJSONType === "value") possibleDelimiters = ",}\\]"

				/**
				 * @type {Boolean} This single-quote is followed by a JSON type
				 *                 delimiter, and likely should be a double-quote.
				 */
				const heuristicDelimiterFollowing =
					!!possibleDelimiters &&
					new RegExp(String.raw`^\s*[${possibleDelimiters}]`).test(
						followingString
					)

				/**
				 * @type {RegExpExecArray|null} Finds a different possible solution.
				 *                 Starting from the current character, and not the
				 *                 `followingString`, so the RegExp includes it in the
				 *                 results array, leaving the capturing group with just
				 *                 the alternate possible and validated solution.
				 */
				const heuristicFindValids = new RegExp(
					String.raw`([^']*)'\s*[${possibleDelimiters}]`
				).exec(misformattedJSON.slice(stringIndex))

				/**
				 * @type {(String|"")} The RegExp validated string capturing group of
				 *                 just the characters before the single-quote to
				 *                 replace in the RexExp auto-filled guess. Skip if
				 *                 empty string, or capturing group is empty string.
				 */
				const regexpCapturingGroup = heuristicFindValids
					? heuristicFindValids[1]
					: ""

				// both this single-quote and a following single-quote
				// have potentially correct resolutions, making the solution ambiguous,
				// so create a new guess to try both solutions
				if (regexpCapturingGroup) {
					// only the following single-quote RegExp heuristic passed,
					// which likely means this is a string character that should be kept,
					// so use RegEpx auto-fill solution

					// this guess will replace the single-quote and end the string
					guesses.push({
						...currentGuess,
						isString: false,
						string: currentGuess.string + '"'
					})

					if (TRY_HARD)
						guesses.push({
							...currentGuess,
							isString: true, // stay string
							string: currentGuess.string + character
						})

					// keep single-quote and use RegExp solution of all characters before
					// single-quote from RegExp search that needs to be replaced
					currentGuess.string += character + regexpCapturingGroup + '"'

					// the length of the entire RegExp guess string
					// including ending double-quote
					currentGuess.aufoFilled = regexpCapturingGroup.length + 1

					// ended string with double-quote
					currentGuess.isString = false
				}

				// only the current single-quote RegExp heuristic passed,
				// which likely means this is a misformatted string delimiter
				else if (heuristicDelimiterFollowing) {
					// WORSE time-complexity mode, custom heuristics but with brute-force
					if (TRY_HARD)
						guesses.push({
							...currentGuess,
							isString: false,
							string: currentGuess.string + character
						})

					// replace current misformatted single-quote with a double-quote
					currentGuess.string += '"'

					// ended string with double-quote
					currentGuess.isString = false
				}

				// neither RegExp heuristic passed,
				// which likely means this is a string character that should be kept
				else {
					// WORSE time-complexity mode, custom heuristics but with brute-force
					if (TRY_HARD)
						guesses.push({
							...currentGuess,
							isString: false, // end string
							string: currentGuess.string + character
						})

					// keep single-quote
					currentGuess.string += character
				}
			}
			// beginning of a JSON string, reformat single-quote
			else {
				// replace single-quote with double-quote
				currentGuess.string += '"'

				// parser now looking for ending single-quote that needs reformatting
				currentGuess.isString = true
			}
		}
	}

	// try all parsing guesses to see if one works
	/**
	 * @type   {Number}      Index of guess for debugging information.
	 */
	let guessIndex = 0

	/**
	 * @type   {String[]}    Array of every valid JSON string reformatted.
	 */
	const successes = []

	for (const guess of guesses) {
		try {
			JSON.parse(guess.string)

			// reformatting guess parsed as valid JSON!
			successes.push(guess.string)

			console.log(`successfully parsed #${guessIndex}:`, guess, successes)
		} catch (error) {
			// // catch JSON parsing error and output for debug
			// console.error(`failed: guess #${guessIndex}:`, guess)
		}

		guessIndex++
	}

	if (successes.length === 1)
		console.log("Parser found definitive answer!\nParsed:", successes[0])
	else if (successes.length > 1)
		console.log(
			"Parser found no definitive answer! Parser found ambiguous answers! Try setting `opts.heuristic` or `opts.bruteForce`, they can get better parsing!\nParsed:",
			successes
		)
	else
		console.error(
			"Parser Failed to parse any reformatting guess as a valid JSON string! Try setting `heuristic`, `TRY_HARD`, or `opts.bruteForce` (if necessary), they can get better parsing!"
		)

	// return all valid JSON string guesses
	return successes
}

const json1 = `['Bob O'Rielly']`
const json2 = `['Mr. O'McDonald, height 13',1\\"']`
const json3 = `[{'fullName':'Bob O'Rielly','height':'13',5\\"'}]`
const json4 = `[[''''''''''''],[[''''''''],'[]','{}',',',':'],'''''''''''''']`
const json5 = `[{'techid':'0128','daPoints':3,'speedingPoints':3,'fleetInspectionPoints':3,'lofPoints':3,'missedTrgModules':null,'fullName':'FIRST LAST','safetyInspectPoints':3,'missedTrgPoints':3,'speeding_qty':null,'safetyTotalPoints':21,'atFaultPoints':3,'atFaultAccident':null,'region':'ABCD','supervisor':'LSAT FRIST','driverAlert':null,'status':'A'}]`
const json6 = `[{'fullName':'Rob O'Rielly','height':'70.5\\"'}]`
const json7 = `[{'fullName':'Dob MacRielly','height':'13',5\\"'}]`

console.log(`ANSWERS 1:`, preParse(json1))
console.log(`ANSWERS 2:`, preParse(json2, undefined, undefined, true))
console.log(`ANSWERS 3:`, preParse(json3, undefined, undefined, true))
console.log(`ANSWER 4:`, preParse(json4))
console.log(`ANSWER 5:`, preParse(json5))
console.log(
	`ANSWER 6:`,
	preParse(json6, () => true, undefined)
)
console.log(`ANSWER 7:`, preParse(json7, undefined, undefined, true))
