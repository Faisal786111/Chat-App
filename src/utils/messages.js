const generateMesage = (username , text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (username , url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  };
};

module.exports = { generateMesage, generateLocationMessage };
