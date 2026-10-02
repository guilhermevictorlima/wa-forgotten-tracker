function matchesMinimumDays(chat, minimumDays) {
  return chat.daysAgo >= minimumDays;
}

function matchesNameQuery(chat, query) {
  return chat.name.toLowerCase().includes(query);
}

export function filterChats(chats, { minimumDays, nameQuery }) {
  return chats.filter((chat) =>
    matchesMinimumDays(chat, minimumDays) && matchesNameQuery(chat, nameQuery)
  );
}
