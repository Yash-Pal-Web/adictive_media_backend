const generateRandomPassword = (firstName, lastName, number) => {
  let part1 = firstName.slice(0, 2);
  let part2 = lastName.slice(-2); 
  let part3 = number.slice(-4); 

  const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  let randomPart = "";
  
  for (let i = 0; i < 4; i++) {
    randomPart += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }

  return `${part1}${randomPart}${part2}${part3}`;
};
module.exports = generateRandomPassword;