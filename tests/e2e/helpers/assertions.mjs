export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message || 'Expected values to be equal'}: actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`
    );
  }
}

export function assertNotEqual(actual, unexpected, message) {
  if (actual === unexpected) {
    throw new Error(
      `${message || 'Expected values to differ'}: both=${JSON.stringify(actual)}`
    );
  }
}

export function assertIncludes(haystack, needle, message) {
  if (typeof haystack !== 'string' || !haystack.includes(needle)) {
    throw new Error(
      `${message || 'Expected string inclusion'}: missing ${JSON.stringify(needle)} in ${JSON.stringify(String(haystack).slice(0, 200))}`
    );
  }
}

export function assertMatch(text, regex, message) {
  if (typeof text !== 'string' || !regex.test(text)) {
    throw new Error(
      `${message || 'Expected regex match'}: ${String(regex)} did not match ${JSON.stringify(String(text).slice(0, 200))}`
    );
  }
}

export function assertInRange(value, min, max, message) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < min || value > max) {
    throw new Error(
      `${message || 'Expected number in range'}: value=${value}, expected [${min}, ${max}]`
    );
  }
}

export function assertGreaterThan(value, minExclusive, message) {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= minExclusive) {
    throw new Error(
      `${message || 'Expected number greater than threshold'}: value=${value}, threshold=${minExclusive}`
    );
  }
}

export function assertBoxesDoNotOverlap(boxA, boxB, labelA, labelB, tolerance = 2) {
  assert(boxA !== null, `Missing bounding box for ${labelA}`);
  assert(boxB !== null, `Missing bounding box for ${labelB}`);

  const overlapX =
    Math.min(boxA.x + boxA.width, boxB.x + boxB.width) - Math.max(boxA.x, boxB.x);
  const overlapY =
    Math.min(boxA.y + boxA.height, boxB.y + boxB.height) - Math.max(boxA.y, boxB.y);

  if (overlapX > tolerance && overlapY > tolerance) {
    throw new Error(
      `HUD overlap detected between ${labelA} ${JSON.stringify(boxA)} and ${labelB} ${JSON.stringify(boxB)} (overlap ${overlapX.toFixed(1)}x${overlapY.toFixed(1)}px)`
    );
  }
}

export function assertNoRuntimeErrors(tracker) {
  const { consoleErrors, pageErrors, httpErrors } = tracker;
  if (consoleErrors.length > 0 || pageErrors.length > 0 || httpErrors.length > 0) {
    const parts = [];
    if (consoleErrors.length > 0) parts.push(`console.error(${consoleErrors.length}): ${consoleErrors.join(' | ')}`);
    if (pageErrors.length > 0) parts.push(`pageerror(${pageErrors.length}): ${pageErrors.join(' | ')}`);
    if (httpErrors.length > 0) parts.push(`httpErrors(${httpErrors.length}): ${httpErrors.join(' | ')}`);
    throw new Error(`Unexpected browser runtime errors: ${parts.join(' ;; ')}`);
  }
}
