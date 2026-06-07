function hasNonWhitespaceText(text) {
  const value = String(text || "");
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code !== 32 && code !== 9 && code !== 10 && code !== 13) {
      return true;
    }
  }
  return false;
}

function defaultRequestKey(method, url, body, isMutation) {
  if (!isMutation) {
    return `${method}:${url}`;
  }
  return null;
}

function createDomainQueue(requestState, domainKey, task) {
  const tail = requestState.queues.get(domainKey) || Promise.resolve();
  const run = tail.then(task, task);
  const queueNext = run.then(
    () => undefined,
    () => undefined,
  );
  requestState.queues.set(domainKey, queueNext);
  queueNext.finally(() => {
    if (requestState.queues.get(domainKey) === queueNext) {
      requestState.queues.delete(domainKey);
    }
  });
  return run;
}

function markCooldown(requestState, domainKey, cooldownMs) {
  requestState.cooldownUntil.set(domainKey, Date.now() + cooldownMs);
}

export {
  hasNonWhitespaceText,
  defaultRequestKey,
  createDomainQueue,
  markCooldown,
};

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    hasNonWhitespaceText,
    defaultRequestKey,
    createDomainQueue,
    markCooldown,
  };
}
