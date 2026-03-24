export function getChatSessionTurnLimit(role = "CLIENT") {
  return 50
}

export function hasReachedChatSessionTurnLimit(turnCount, role = "CLIENT") {
  return Number(turnCount) >= getChatSessionTurnLimit(role)
}
