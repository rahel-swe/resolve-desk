export const greetingUtils = () => {
  const currentDate = new Date()

  const greeting =
    currentDate.getHours() < 12
      ? 'Good morning'
      : currentDate.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening'

  return {
    greeting,
    currentDate,
  }
}
