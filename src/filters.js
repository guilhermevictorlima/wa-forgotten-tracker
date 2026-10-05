function matchesMinimumDays(chat, minimumDays) {
  return chat.daysAgo >= minimumDays;
}

function matchesMaximumDays(chat, maximumDays) {
  return chat.daysAgo <= maximumDays;
}

function matchesNameQuery(chat, query) {
  return chat.name.toLowerCase().includes(query);
}

export function filterChats(chats, { minimumDays, maximumDays, nameQuery }) {
  return chats.filter((chat) =>
    matchesMinimumDays(chat, minimumDays) &&
    matchesMaximumDays(chat, maximumDays) &&
    matchesNameQuery(chat, nameQuery)
  );
}