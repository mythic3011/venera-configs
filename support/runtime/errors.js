function createRuntimeInvalidStatusError(status, context) {
  const suffix = context ? ` (${context})` : "";
  return `Invalid status code: ${status}${suffix}`;
}

function assertRuntimeStatus(response, expectedStatus, context) {
  const statusList = Array.isArray(expectedStatus)
    ? expectedStatus
    : [expectedStatus == null ? 200 : expectedStatus];
  const status =
    response && typeof response.status === "number" ? response.status : -1;
  if (!statusList.includes(status)) {
    throw createRuntimeInvalidStatusError(status, context);
  }
  return response;
}

export {
  createRuntimeInvalidStatusError,
  assertRuntimeStatus,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createRuntimeInvalidStatusError,
    assertRuntimeStatus,
  };
}
