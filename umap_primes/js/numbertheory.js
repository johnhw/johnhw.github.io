(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

/**
 * Number theory toolkit for JavaScript.
 * @author Ryan Sandor Richards (@rsandor)
 * @author Jim Fowler (@kisonecat)
 * @module number-theory
 */
module.exports = {
  divisors: require('./lib/divisors'),
  eulerPhi: require('./lib/euler_phi'),
  factor: require('./lib/factor'),
  findDivisor: require('./lib/find_divisor'),
  gcd: require('./lib/gcd'),
  incMixed: require('./lib/inc_mixed'),
  inverseMod: require('./lib/inverse_mod'),
  isAbundant: require('./lib/is_abundant'),
  isDeficient: require('./lib/is_deficient'),
  isHeptagonal: require('./lib/is_heptagonal'),
  isHexagonal: require('./lib/is_hexagonal'),
  isOctagonal: require('./lib/is_octagonal'),
  isPentagonal: require('./lib/is_pentagonal'),
  isPerfect: require('./lib/is_perfect'),
  isPrime: require('./lib/is_prime'),
  isProbablyPrime: require('./lib/miller'),
  isSquare: require('./lib/is_square'),
  isTriangular: require('./lib/is_triangular'),
  jacobiSymbol: require('./lib/jacobi_symbol'),
  logMod: require('./lib/log_mod'),
  miller: require('./lib/miller'),
  multiplyMod: require('./lib/multiply_mod'),
  powerMod: require('./lib/power_mod'),
  primeFactors: require('./lib/prime_factors'),
  primitiveRoot: require('./lib/primitive_root'),
  quadraticNonresidue: require('./lib/quadratic_nonresidue'),
  randomPrimitiveRoot: require('./lib/random_primitive_root'),
  sieve: require('./lib/sieve'),
  squareRootMod: require('./lib/square_root_mod'),
  squareRootModPrime: require('./lib/square_root_mod_prime'),
  totient: require('./lib/euler_phi'),
};

},{"./lib/divisors":2,"./lib/euler_phi":3,"./lib/factor":4,"./lib/find_divisor":5,"./lib/gcd":6,"./lib/inc_mixed":7,"./lib/inverse_mod":8,"./lib/is_abundant":9,"./lib/is_deficient":10,"./lib/is_heptagonal":11,"./lib/is_hexagonal":12,"./lib/is_octagonal":13,"./lib/is_pentagonal":14,"./lib/is_perfect":15,"./lib/is_prime":16,"./lib/is_square":17,"./lib/is_triangular":18,"./lib/jacobi_symbol":19,"./lib/log_mod":20,"./lib/miller":21,"./lib/multiply_mod":22,"./lib/power_mod":23,"./lib/prime_factors":24,"./lib/primitive_root":25,"./lib/quadratic_nonresidue":26,"./lib/random_primitive_root":27,"./lib/sieve":28,"./lib/square_root_mod":29,"./lib/square_root_mod_prime":30}],2:[function(require,module,exports){
'use strict';

var factor = require('./factor');
var incMixed = require('./inc_mixed');

/**
 * Determines all of the divisors for a given number.
 * @param {Number} n Number for which to find the factors.
 * @return {Array} A list of all divisors for the given number.
 * @module number-theory
 * @author Ryan Sandor Richards
 */
module.exports = function divisors(n) {
  var factors = factor(n);
  var powers = factors.map(function (factor) {
    return 0;
  });
  var maxPowers = factors.map(function (factor) {
    return factor.power;
  });

  var divisors = [1];
  while (true) {
    powers = incMixed(powers, maxPowers);
    var d = powers.map(function (m, i) {
      return Math.pow(factors[i].prime, m);
    }).reduce(function (memo, curr) {
      return memo * curr;
    }, 1);
    if (d === 1) break;
    divisors.push(d);
  }

  divisors.sort(function (a, b) {
    return parseInt(a) - parseInt(b);
  });
  return divisors;
};

},{"./factor":4,"./inc_mixed":7}],3:[function(require,module,exports){
'use strict';

var primeFactors = require('./prime_factors');

/**
 * Compute Euler's totient function phi. Computed via Euler's product formula,
 * see: http://en.wikipedia.org/wiki/Euler%27s_totient_function
 * @param {Number} n Integer for which to return the totient.
 * @return the number of positive integers less than or equal to n that are
 *   relatively prime to n.
 * @module number-theory
 * @author Jim Fowler, Ryan Sandor Richards
 */
module.exports = function eulerPhi(n) {
  var product = function (list) {
    return list.reduce(function (memo, number) {
      return memo * number;
    }, 1);
  };
  var factors = primeFactors(n);

  // Product{p-1} for all prime factors p
  var N = product(factors.map(function (p) { return p - 1; }))

  // Product{p} for all prime factors p
  var D = product(factors);

  // Compose the product formula and return
  return n * N / D;
};

},{"./prime_factors":24}],4:[function(require,module,exports){
'use strict';

var sieve = require('./sieve');
var primes = sieve(100000);

/**
 * Factors a given integer.
 * @param {Number} n Number to factor.
 * @return {Array} A list of prime factors and the powers of those factors.
 * @module number-theory
 * @author Ryan Sandor Richards, Jim Fowler
 */
module.exports = function factor(n) {
  if ((!primes) || (primes[primes.length - 1] < n)) {
    primes = sieve(n);
  }

  var factors = [];
  for (var k = 0; k < primes.length && n > 1; k++) {
    var p = primes[k];
  	if (n % p === 0) {
	    var factor = { prime: p, power: 0 };
	    while (n % p === 0) {
        factor.power++;
        n /= p;
      }
      factors.push(factor);
    }
  }

  if (n > 1) {
    // Whatever remains, if it is not 1, must be prime
    factors.push( { prime: n, power: 1 } );
  }
  return factors;
};

},{"./sieve":28}],5:[function(require,module,exports){
'use strict';

var gcd = require('./gcd');

/**
 * Given composite x with a small prime factor, Pollard's rho
 * algorithm often finds the small factor quickly.
 *
 * Modified from
 * http://userpages.umbc.edu/~rcampbel/NumbThy/Class/Programming/JavaScript
 *
 * @param {Number} a number x
 * @return {Number} a number dividing x (possibly 1).
 * @module number-theory
 * @author Jim Fowler
 */
module.exports = function findDivisor(x) {
  var numsteps = 2 * Math.floor( Math.sqrt( Math.sqrt(x) ) );
  var slow = 2;
  var fast = slow;
  var thegcd;
  for (var i = 1; i < numsteps; i++){
    slow = (slow * slow + 1) % x;
    fast = (fast * fast + 1) % x;
    fast = (fast * fast + 1) % x;
    thegcd = gcd(fast - slow, x);
    if (thegcd != 1) {
      return thegcd;
    }
  }
  return 1;
};

},{"./gcd":6}],6:[function(require,module,exports){
'use strict';

/**
 * Finds the greatest common divisor between two integers.
 * @param {Number} a First integer.
 * @param {Number} b Second integer.
 * @return The gcd of a and b.
 * @module number-theory
 * @author Ryan Sandor Richards, Jim Fowler
 */
module.exports = function gcd(a, b) {
  if (a < 0) { a = -a; }
  if (b < 0) { b = -b; }
  while (true) {
    if (b === 0) { return a; }
    a %= b;
    if (a === 0) { return b; }
    b %= a;
  }
};

},{}],7:[function(require,module,exports){
'use strict';

/**
 * Increment an n-dimensional tuple of integers representing a number with
 * mixed digit bases.
 *
 * @example
 * incMixed([0, 0], [1, 2]) // Returns [1, 0]
 * incMixed([1, 0], [1, 2]) // Returns [0, 1]
 * incMixed([0, 1], [1, 2]) // Returns [1, 1]
 * incMixed([1, 1], [1, 2]) // Returns [0, 2]
 * incMixed([0, 2], [1, 2]) // Returns [1, 2]
 * incMixed([1, 2], [1, 2]) // Returns [0, 0]
 *
 * @param {array} tuple A mixed base number.
 * @param {array} bases The bases for each of the "digit" entries in the tuple.
 * @return {array} The next number in the sequence.
 * @module number-theory
 * @author Ryan Sandor Richards
 */
module.exports = function incMixed(tuple, bases) {
  var result = tuple.map(function (value) { return value; });
  result[0]++;
  for (var k = 0; k < tuple.length; k++) {
    if (result[k] <= bases[k]) {
      break;
    }
    else if (k !== tuple.length - 1){
      result[k] = 0;
      result[k+1]++;
    }
    else {
      result[k] = 0;
    }
  }
  return result;
};

},{}],8:[function(require,module,exports){
'use strict';

/**
 * Find an inverse for a modulo n.
 * See: http://en.wikipedia.org/wiki/Modular_multiplicative_inverse
 * @param {Number} a Integer relatively prime to n
 * @param {Number} n Integer modulus
 * @return an integer b so that a * b equv 1 mod n
 * @module number-theory
 * @author Jim Fowler
 */
module.exports = function inverseMod(a, n) {
  if (a < 0) {
    a = (a % n) + n;
  }

  var t = 0;
  var newt = 1;
  var r = n;
  var newr = a;

  while(newr !== 0) {
    var quotient = Math.floor(r/newr);
    var oldt = t;
    t = newt;
    newt = oldt - quotient * newt;

    var oldr = r;
    r = newr;
    newr = oldr - quotient * newr;
  }

  if(r > 1) { return NaN };

  return (t > 0) ? t : (t+n);
};

},{}],9:[function(require,module,exports){
'use strict';

var divisors = require('./divisors');

/**
  * Determines whether an integer is 'abundant'.
  *
  * @param {Number} an integer x to test
  * @return {Boolean} Whether or not x is abundant.
  * @module number-theory
  * @author Kelly Innes
  */

module.exports = function isAbundant(n) {
  if (n === 1) { return false }
  var divisorsOfNumber = divisors(n);
  divisorsOfNumber.pop(); // to remove n and leave the 'proper divisors'
  var sumOfDivisors = divisorsOfNumber.reduce(function(a,b) { 
    return a + b
  });
  return n < sumOfDivisors;
};

},{"./divisors":2}],10:[function(require,module,exports){
'use strict';

var divisors = require('./divisors');

/**
  * Determines whether an integer is 'deficient'.
  *
  * @param {Number} an integer x to test
  * @return {Boolean} Whether or not the x is deficient.
  * @module number-theory
  * @author Kelly Innes
  */

module.exports = function isDeficient(n) {
  if (n === 1) { return true };
  var divisorsOfNumber = divisors(n);
  divisorsOfNumber.pop(); // to remove n and leave the 'proper divisors'
  var sumOfDivisors = divisorsOfNumber.reduce(function(a,b) { 
    return a + b
  });
  return n > sumOfDivisors;
};

},{"./divisors":2}],11:[function(require,module,exports){
'use strict';

/**
  * Determines whether an integer is 'heptagonal'.
  * Algorithm works by finding the 'heptagonal root' of an int,
  * then checking whether that root is a whole number.
  * See: https://en.wikipedia.org/wiki/Heptagonal_number
  *
  * @param {Number} an integer x to test
  * @return {Boolean} Whether or not the x is heptagonal.
  * @module number-theory
  * @author Kelly Innes
  */

module.exports = function isHeptagonal(n) {
  return (((Math.sqrt((40 * n) + 9)) + 3) / 10) % 1 === 0;
};

},{}],12:[function(require,module,exports){
'use strict';

/**
  * Determines whether an integer is 'hexagonal'.
  * Algorithm works by finding the 'hexagonal root' of an int,
  * then checking whether the root's a whole number.
  * See: https://en.wikipedia.org/wiki/Hexagonal_number
  *
  * @param {Number} an integer x to test
  * @return {Boolean} Whether or not the x is hexagonal.
  * @module number-theory
  * @author Kelly Innes
  */

module.exports = function isHexagonal(n) {
  return ((Math.sqrt((8 * n) + 1) + 1) / 4) % 1 === 0;
};

},{}],13:[function(require,module,exports){
'use strict';

/**
  * Determines whether an integer is 'octagonal'.
  * Algorithm works by finding the 'octagonal root' of an int,
  * then checking to see whether the result's a whole number.
  * See: https://en.wikipedia.org/wiki/Octagonal_number
  *
  * @param {Number} an integer x to test
  * @return {Boolean} Whether or not the x is octagonal.
  * @module number-theory
  * @author Kelly Innes
  */

module.exports = function isOctagonal(n) {
  return (((Math.sqrt((3 * n) + 1)) + 1) / 3) % 1 == 0;
};

},{}],14:[function(require,module,exports){
'use strict';

/**
  * Determines whether an integer is 'pentagonal'.
  * Algorithm works by finding the 'pentagonal root' of an int,
  * then checking whether the result's a whole number.
  * See: https://en.wikipedia.org/wiki/Pentagonal_number
  *
  * @param {Number} an integer x to test
  * @return {Boolean} Whether or not the x is pentagonal.
  * @module number-theory
  * @author Kelly Innes
  */

module.exports = function isPentagonal(n) {
  return ((Math.sqrt((24 * n) + 1) + 1) / 6) % 1 === 0;
};

},{}],15:[function(require,module,exports){
'use strict';

var divisors = require('./divisors');

/**
  * Determines whether an integer is 'perfect'.
  *
  * @param {Number} an integer x to test
  * @return {Boolean} Whether or not x is perfect.
  * @module number-theory
  * @author Kelly Innes
  */

module.exports = function isPerfect(n) {
  if (n === 1) { return false }
  var divisorsOfNumber = divisors(n);
  divisorsOfNumber.pop(); // to remove n and leave the 'proper divisors'
  var sumOfDivisors = divisorsOfNumber.reduce(function(a,b) { 
    return a + b
  });
  return n === sumOfDivisors;
};

},{"./divisors":2}],16:[function(require,module,exports){
'use strict';

var factor = require('./factor');

/**
 * Determines whether an integer is prime. Note this is a very slow method that
 * uses direct factoring from a sieve. For a faster primality check use the
 * `miller` method.
 * @param {Number} an integer x to test
 * @return {Boolean} Whether or not the x is prime.
 * @module number-theory
 * @author Jim Fowler
 */
module.exports = function isPrime(p) {
  var factors = factor(p);
  if (factors.length != 1) {
    return false;
  }
  return (factors[0].power === 1);
};

},{"./factor":4}],17:[function(require,module,exports){
'use strict';

/**
  * Determines whether an integer is 'square'.
  * Algorithm works by finding the 'square root' of an int,
  * then checking whether the result is a whole number.
  * See: https://en.wikipedia.org/wiki/Square_number
  *
  * @param {Number} an integer x to test
  * @return {Boolean} Whether or not the x is square.
  * @module number-theory
  * @author Kelly Innes
  */

module.exports = function isSquare(n) {
  return (Math.sqrt(n)) % 1 === 0;
};

},{}],18:[function(require,module,exports){
'use strict';

/**
  * Determines whether an integer is 'triangular'.
  * Algorithm works by finding the 'triangular root' of an int,
  * then checking whether the result is a whole number.
  * See: https://en.wikipedia.org/wiki/Triangular_number
  *
  * @param {Number} an integer x to test
  * @return {Boolean} Whether or not the x is triangular.
  * @module number-theory
  * @author Kelly Innes
  */

module.exports = function isTriangular(n) {
  return (Math.sqrt((8 * n) + 1)) % 1 === 0;
};

},{}],19:[function(require,module,exports){
'use strict';

/**
 * The Jacobi symbol generalizes the Legendre symbol (a on p); when a equiv
 * 0 mod p, (a on p) = 0, but otherwise (a on p) is +1 or -1 depending as to
 * whether there is or is not an integer r so that r^2 equiv a mod p.
 *
 * See: http://en.wikipedia.org/wiki/Jacobi_symbol
 * See also: http://en.wikipedia.org/wiki/Legendre_symbol
 *
 * @param {Number} a An integer.
 * @param {Number} b An integer b which factors into primes p_1 ... p_k
 * @return the product of the Legendre symbols (a on p_1) * ... * (a on p_k)
 * @module number-theory
 * @author Jim Fowler
 */
module.exports = function jacobiSymbol(a,b) {
  if (b % 2 === 0) { return NaN };
  if (b < 0) { return NaN };

  // (a on b) is independent of equivalence class of a mod b
  if (a < 0) {
    a = ((a % b) + b);
  }

  // flips just tracks parity, so I xor terms with it and end up looking at the
  // low order bit
  var flips = 0;

  while(true) {
    a = a % b;

    // (0 on b) = 0
    if (a === 0) { return 0; }

    // Calculation of (2 on b)
  	while ((a % 2) === 0) {
      // b could be so large that b*b overflows
      flips ^= ((b % 8)*(b % 8) - 1)/8;
      a /= 2;
  	}

    // (1 on b) = 1
    if (a == 1) {
	    // look at the low order bit of flips to extract parity of total flips
	    return (flips & 1) ? (-1) : 1;
    }

  	// Now a and b are coprime and odd, so "QR" applies
  	// By reducing modulo 4, I avoid the possibility that (a-1)*(b-1) overflows
    flips ^= ((a % 4)-1) * ((b % 4)-1) / 4;

    var temp = a;
    a = b;
    b = temp;
  }

  // Cannot get here
  return NaN;
};

},{}],20:[function(require,module,exports){
'use strict';

var powerMod = require('./power_mod');
var multiplyMod = require('./multiply_mod');

// Cache for the discrete log tables
var babyStepGiantStepTables = {};

/**
 * Solves the discrete log problem.
 *
 * See:
 * http://en.wikipedia.org/wiki/Discrete_logarithm
 * http://en.wikipedia.org/wiki/Baby-step_giant-step
 * 
 * @param {Number} x An integer
 * @param {Number} g A generator of the group of units in Z mod modulus
 * @param {Number} modulus A modulus
 * @return {Number} An integer k so that g^k equiv x mod m.
 * @module number-theory
 */
module.exports = function logMod(x, g, modulus) {
  // normalize x to be positive
  x = ((x % modulus) + modulus) % modulus;

  var m = Math.ceil( Math.sqrt(modulus) );
  var hash = {};

  if (babyStepGiantStepTables[modulus] === undefined) {
    babyStepGiantStepTables[modulus] = {};
  }

  if (babyStepGiantStepTables[modulus][g] === undefined) {
    babyStepGiantStepTables[modulus][g] = {};
    hash = babyStepGiantStepTables[modulus][g];
    for (var j = 0; j < m; j++) {
      // Compute g^j and store the pair (j, g^j) in the hash
      // table.
	    hash[powerMod( g, j, modulus )] = j;
    }
  }
  else {
    hash = babyStepGiantStepTables[modulus][g];
  }

  var generatorInverseM = powerMod( g, -m, modulus );
  var location = x;

  for (var i = 0; i < m; i++) {
    // Check to see if location is the second component (g^j) of any
    // pair in the table.
    if (hash[location] !== undefined) {
      // If so, return i*m + j.
	    return ( multiplyMod(i, m, modulus) + hash[location] ) % modulus;
	  }
    else {
      // If not, update location.
	    location = multiplyMod( location, generatorInverseM, modulus );
    }
  }

  return NaN;
};

},{"./multiply_mod":22,"./power_mod":23}],21:[function(require,module,exports){
'use strict';

var multiplyMod = require('./multiply_mod');
var powerMod = require('./power_mod');

/**
 * Deterministic miller-rabin primality test.
 * @param {Number} n Integer < 341,550,071,728,321 for which to test primality.
 * @return `true` if the number is prime, `false` otherwise.
 * @module number-theory
 * @author Ryan Sandor Richards
 */
module.exports = function miller(n) {
  if (n < 2) return false;
  if (n == 2 || n == 3) return true;
  if (!(n & 1) || n % 3 == 0) return false;

  // Find n-1 = 2^s * d such that d is odd
  var d = n - 1;
  var s = 0;
  while( (d % 2) === 0 ) {
    d = d / 2;
    s = s + 1;
  }

  var witnesses;

  if (n < 1373653) {
    witnesses = [2, 3];
  } else if (n < 9080191) {
    witnesses = [31, 73];
  } else if (n < 4759123141) {
    witnesses = [2, 7, 61];
  } else if (n < 1122004669633) {
    witnesses = [2, 13, 23, 1662803];
  } else if (n < 2152302898747) {
    witnesses = [2, 3, 5, 7, 11];
  } else if (n < 3474749660383) {
    witnesses = [2, 3, 5, 7, 11, 13];
  } else {
    witnesses = [2, 3, 5, 7, 11, 13, 17];
  }

  for (var i = 0; i < witnesses.length; i++) {
    var a = witnesses[i];
    var x = powerMod(a, d, n);
    var y = 0;
    var q = s;
    while (q > 0) {
      y = multiplyMod( x, x, n );
      if (y === 1 && x !== 1 && x !== n - 1) { return false; }
      x = y;
			--q;
    }
    if (y !== 1) { return false; }
  }

  return true;
};

},{"./multiply_mod":22,"./power_mod":23}],22:[function(require,module,exports){
'use strict';

/**
 * Multiply two numbers (up to 2^52) in Z mod m.  JavaScript numbers
 * are stored as floats, and Number.MAX_SAFE_INTEGER ==
 * 9007199254740991, so multiplication (a * b) % m works fine if the
 * modulus is less than sqrt(Number.MAX_SAFE_INTEGER) approx 94906265.
 * This routine gets around this barrier and permits the modulus to be
 * as large as 2^52 at the price of a loop.
 *
 * This is a modification of some code from Wikipedia, replacing
 * bitshifts with floating point arithmetic to avoid JavaScript's
 * coercing the floats back to 32-bit integers.
 *
 * @param {Number} an integer a (up to 2^52)
 * @param {Number} an integer b (up to 2^52)
 * @param {Number} a modulus m (up to 2^52)
 * @return {Number} the result of a * b mod m
 * @module number-theory
 * @author Jim Fowler
 */
module.exports = function multiplyMod(a, b, m) {
  // For small enough numbers, we can multiply without overflowing
  if ((a < 94906265) && (b < 94906265)) {
    return (a*b) % m;
  }

  var d = 0;

  // Bitshifts in javascript reduce everything to 32-bit ints, but with
  // division we can get 53-bit resolutions as a float
  var mp2 = m / 2;

  if (a >= m) a %= m;
  if (b >= m) b %= m;

  for (var i = 0; i < 53; i++) {
  	d = (d >= mp2) ? (2 * d - m) : (2 * d);

  	// Checking top bit (but I can't use bitwise operators without coercing down
  	// to 32 bits)
  	if (a >= 4503599627370496) {
      d += b;
      a = a - 4503599627370495;
  	}

  	if (d > m) {
      d -= m;
    }
  	a *= 2;
  }

  return d;
};

},{}],23:[function(require,module,exports){
'use strict';

var multiplyMod = require('./multiply_mod');
var inverseMod = require('./inverse_mod');

/**
 * Performs a power modulo some integer.
 * @param {Number} base Base for the power.
 * @param {Number} exponent Exponent of the power.
 * @param {Number} mod Modulus.
 * @return The base raised to the exponent power modulo the mod.
 * @module number-theory
 * @author Ryan Richards, Jim Fowler
 */
module.exports = function powerMod(base, exponent, mod) {
  if (exponent < 0) {
    return inverseMod(powerMod(base,-exponent,mod),mod);
  }

  var result = 1;
  base = base % mod;

  while (exponent > 0) {
    if (exponent % 2 == 1) {
      // Use modulus multiplication to avoid overflow
      result = multiplyMod(result, base, mod);
      exponent -= 1;
    }

    // using /2 instead of >>1 to work with numbers up to 2^52
    exponent /= 2;

    // Use modulus multiplication to avoid overflow
    base = multiplyMod(base, base, mod);
  }
  return result;
};

},{"./inverse_mod":8,"./multiply_mod":22}],24:[function(require,module,exports){
'use strict';

var factor = require('./factor');

/**
 * Returns the prime factors for a given number.
 * @param {Number} n Number for which to find the prime factors.
 * @return {Array} The prime factors of n.
 * @module number-theory
 * @author Ryan Sandor Richards
 */
module.exports = function primeFactors(n) {
  return factor(n).map(function (f) { return f.prime });
};

},{"./factor":4}],25:[function(require,module,exports){
'use strict';

var _ = require('underscore');

var eulerPhi = require('./euler_phi');
var primeFactors = require('./prime_factors');
var powerMod = require('./power_mod');

/**
 * Find the smallest primitive root for Z mod n, meaning a multiplicative
 * generator for the group of units of Z mod n.
 *
 * See: http://en.wikipedia.org/wiki/Primitive_root_modulo_n
 *
 * @param {Number} modulus An integer > 2
 * @return an integer g so that every integer coprime to n is congruent to a
 *   power of g, modulo n.
 * @module number-theory
 * @author Jim Fowler
 */
module.exports = function primitiveRoot(modulus) {
  var phi_m = eulerPhi(modulus);
  var factors = primeFactors(phi_m);
  for (var x = 2; x < modulus; x++) {
    var check = _.every(factors, function(p) {
      return powerMod( x, phi_m / p, modulus ) != 1;
    })
    if (check) { return x; }
  }
  return NaN;
};

},{"./euler_phi":3,"./power_mod":23,"./prime_factors":24,"underscore":31}],26:[function(require,module,exports){
'use strict';

var jacobiSymbol = require('./jacobi_symbol');

/**
 * Find a quadratic nonresidue.
 * See: http://en.wikipedia.org/wiki/Quadratic_residue
 * @param {Number} p A prime number.
 * @return {Number} A number b so that there is no c with c^2 = b mod p
 * @module number-theory
 * @author Jim Fowler
 */
module.exports = function quadraticNonresidue(p) {
  for (var x = 2; x < p; x++) {
    if (jacobiSymbol(x, p) == -1) { return x; }
  }
  return NaN;
};

},{"./jacobi_symbol":19}],27:[function(require,module,exports){
'use strict';

var primitiveRoot = require('./primitive_root');
var eulerPhi = require('./euler_phi');
var gcd = require('./gcd');
var powerMod = require('./power_mod');

/**
 * Find a random primitive root for Z mod n, meaning a multiplicative generator
 * for the group of units of Z mod n. Unlike primitiveRoot, this function
 * returns a random primitive root.
 * @param {Number} modulus Integer for which to find the random primitive root.
 * @return {Number} An integer g so that every integer coprime to n is congruent
 *   to a power of g, modulo n.
 * @module number-theory
 * @author Jim Fowler
 */
module.exports = function randomPrimitiveRoot(modulus) {
  var g = primitiveRoot(modulus);
  var eulerPhiModulus = eulerPhi(modulus);
  for (var trials = 0; trials < 100; trials++) {
    var i = Math.floor( Math.random() * eulerPhiModulus );
    if (gcd(i, eulerPhiModulus) == 1) {
      return powerMod( g, i, modulus );
    }
  }
  return g;
};

},{"./euler_phi":3,"./gcd":6,"./power_mod":23,"./primitive_root":25}],28:[function(require,module,exports){
'use strict';

/**
 * Sieves primes from 1 to the given number.
 * @param {Number} n Upper bound for the sieve.
 * @return {Array} A list of primes between 1 and n.
 * @module number-theory
 * @author Ryan Sandor Richards
 */
module.exports = function sieve(n) {
  var numbers = new Array(n);

  for (var i = 0; i < n; i++) {
    numbers[i] = true;
  }

  for (var i = 2; i < Math.sqrt(n); i++) {
    for (var j = i*i; j < n; j += i) {
      numbers[j] = false;
    }
  }

  var primes = [];
  for (var i = 2; i < n; i++) {
    if (numbers[i]) {
      primes.push(i);
    }
  }

  return primes;
};

},{}],29:[function(require,module,exports){
'use strict';

var _ = require('underscore');

var factor = require('./factor');
var squareRootModPrime = require('./square_root_mod_prime');
var jacobiSymbol = require('./jacobi_symbol');
var inverseMod = require('./inverse_mod');
var multiplyMod = require('./multiply_mod');

/**
 * Find all square roots of a given number n modulo m.
 * @param {Number} n A quadratic residue
 * @param {Number} modulus A modulus
 * @return {Array} Representatives of all square roots of n modulo m.
 * @module number-theory
 * @author Jim Fowler
 */
module.exports = function squareRootMod(n, modulus) {
  var m = 1;
  var results = [0];

  factor(modulus).forEach(function (f) {
    var p = f.prime;
  	var exponent = f.power;
  	var s = squareRootModPrime( n, p );

  	// Chinese remainder theorem
  	var combined = [];
  	if (jacobiSymbol(n, p) != 1) { return []; }

    results.forEach(function (r) {
      // find a lift of r mod m and s mod p
      combined.unshift( r * p * inverseMod(p, m) + s * m * inverseMod(m, p) );
      combined.unshift( r * p * inverseMod(p, m) - s * m * inverseMod(m, p) );
    });

  	combined.sort();
  	results = _.unique(combined);

  	m = m * p;
  	var soFar = 1;
  	exponent--;

  	while (exponent > 0) {
      var q = Math.pow( p, Math.min( soFar, exponent ) );
      exponent -= Math.min( soFar, exponent );

      // Hensel's lemma
      // see: http://en.wikipedia.org/wiki/Hensel%27s_lemma
      results = results.map(function (r) {
        var A = -((r*r - n) / m);
        var B = inverseMod(2 * r, q);
        return r + m * multiplyMod(A, B, q);
      });

      m = m * q;
  	}
  });

  return results.map(function (r) {
    return ((r % modulus) + modulus) % modulus;
  });
};

},{"./factor":4,"./inverse_mod":8,"./jacobi_symbol":19,"./multiply_mod":22,"./square_root_mod_prime":30,"underscore":31}],30:[function(require,module,exports){
'use strict';

var jacobiSymbol = require('./jacobi_symbol');
var powerMod = require('./power_mod');
var quadraticNonresidue = require('./quadratic_nonresidue');

/**
 * Find a single square root in Z mod p using the Tonelli–Shanks algorithm.
 *
 * See: http://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm
 *
 * @param {Number} m A quadratic residue
 * @param {Number} p A prime number
 * @return {Number} A number b so b^2 = n mod p.
 * @module number-theory
 * @author Jim Fowler
 */
module.exports = function squareRootModPrime(n, p) {
  if (jacobiSymbol(n,p) != 1) { return NaN; }

  var Q = p - 1;
  var S = 0;
  while( (Q % 2) === 0 ) {
    Q /= 2;
    S++;
  }

  // Now p - 1 = Q 2^S and Q is odd.
  if ((p % 4) == 3) {
  	return powerMod( n, (p+1)/4, p );
  }

  // So S != 1 (since in that case, p equiv 3 mod 4
  var z = quadraticNonresidue(p);
  var c = powerMod(z, Q, p);
  var R = powerMod(n, (Q+1)/2, p);
  var t = powerMod(n, Q, p);
  var M = S;

  while(true) {
    if ((t % p) == 1) return R;

    // Find the smallest i (0 < i < M) such that t^{2^i} = 1
    var u = t;
    for(var i = 1; i < M; i++) {
	    u = (u * u) % p;
	    if (u == 1) break;
    }

    var minimum_i = i;
    i++;

    // Set b = c^{2^{M-i-1}}
    var b = c;
    while( i < M ) {
	    b = (b * b) % p;
	    i++;
    }

  	M = minimum_i;
  	R = (R * b) % p;
  	t = (t * b * b) % p;
  	c = (b * b) % p;
  }

  return NaN;
};

},{"./jacobi_symbol":19,"./power_mod":23,"./quadratic_nonresidue":26}],31:[function(require,module,exports){
(function (global){
//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this ||
            {};

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.9.1';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      // The 2-argument case is omitted because we’re not using it.
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  var builtinIteratee;

  // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  };

  // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.
  _.iteratee = builtinIteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // Some functions take a variable number of arguments, or a few expected
  // arguments at the beginning and then a variable number of values to operate
  // on. This helper accumulates all remaining arguments past the function’s
  // argument length (or an explicit `startIndex`), into an array that becomes
  // the last argument. Similar to ES6’s "rest parameter".
  var restArguments = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var has = function(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  }

  var deepGet = function(obj, path) {
    var length = path.length;
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }
    return length ? obj : void 0;
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  var createReduce = function(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function(obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = restArguments(function(obj, path, args) {
    var contextPath, func;
    if (_.isFunction(path)) {
      func = path;
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }
    return _.map(obj, function(context) {
      var method = func;
      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }
        if (context == null) return void 0;
        method = context[path];
      }
      return method == null ? method : method.apply(context, args);
    });
  });

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection.
  _.shuffle = function(obj) {
    return _.sample(obj, Infinity);
  };

  // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior, partition) {
    return function(obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (has(result, key)) result[key]++; else result[key] = 1;
  });

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, Boolean);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = restArguments(function(array, otherArrays) {
    return _.difference(array, otherArrays);
  });

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = restArguments(function(arrays) {
    return _.uniq(flatten(arrays, true, true));
  });

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = restArguments(function(array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  });

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = restArguments(_.unzip);

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of _.pairs.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions.
  var createPredicateIndexFinder = function(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test.
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions.
  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.
  _.chunk = function(array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0, length = array.length;
    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = restArguments(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
  _.partial = restArguments(function(func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  _.partial.placeholder = _;

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = restArguments(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  });

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = restArguments(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
  });

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;

    var later = function(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function(args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  _.restArguments = restArguments;

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
        length = keys.length,
        results = {};
    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  // The opposite of _.object.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, defaults) {
    return function(obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test.
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Internal pick helper function to determine if `obj` has key `key`.
  var keyInObj = function(value, key, obj) {
    return key in obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = restArguments(function(obj, keys) {
    var result = {}, iteratee = keys[0];
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

  // Return a copy of the object without the blacklisted properties.
  _.omit = restArguments(function(obj, keys) {
    var iteratee = keys[0], context;
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  });

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
  var nodelist = root.document && root.document.childNodes;
  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, path) {
    if (!_.isArray(path)) {
      return has(obj, path);
    }
    var length = path.length;
    for (var i = 0; i < length; i++) {
      var key = path[i];
      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }
      obj = obj[key];
    }
    return !!length;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  // Creates a function that, when passed an object, will traverse that object’s
  // properties down the given `path`, specified as an array of keys or indexes.
  _.property = function(path) {
    if (!_.isArray(path)) {
      return shallowProperty(path);
    }
    return function(obj) {
      return deepGet(obj, path);
    };
  };

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    if (obj == null) {
      return function(){};
    }
    return function(path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.
  _.result = function(obj, path, fallback) {
    if (!_.isArray(path)) path = [path];
    var length = path.length;
    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
    }
    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];
      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }
      obj = _.isFunction(prop) ? prop.call(obj) : prop;
    }
    return obj;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var chainResult = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return String(this._wrapped);
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define == 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],32:[function(require,module,exports){
ntheory = require("number-theory");
},{"number-theory":1}]},{},[32]);
