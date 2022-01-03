const userNeed = [
  {
    name: "Pintar casa",
    description: "Pintar la casa completa",
    status: "in offer",
    location: "Buenos Aires, Argentina",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 51,
  },
  {
    name: "Pintar casa",
    description: "Pintar la casa completa",
    status: "in offer",
    location: "Buenos Aires, Argentina",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 65,
  },
  {
    name: "Contacto de luz",
    description: "Cambiar apagador de foco",
    status: "in progress",
    location: "Cancún, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 78,
  },
  {
    name: "Contacto de luz",
    description: "Cambiar apagador de foco",
    status: "in progress",
    location: "Cancún, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 79,
  },
  {
    name: "Contacto de luz",
    description: "Cambiar apagador de foco",
    status: "in progress",
    location: "Cancún, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 80,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 90,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 61,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 60,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 77,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 78,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 79,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 98,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 56,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 57,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 89,
  },
  {
    name: "Puertas de closet",
    description: "Reparar y barnizar puertas de closet de madera.",
    status: "in offer",
    location: "Tapachula, México",
    price: 1200,
    duration: 60,
    guarantee_time: 15,
    userId: 52,
  },
];

const needMap = userNeed.map((el) => {
  return {
    name: el.name,
    description: el.description,
    status: el.status,
    location: el.location,
    price: el.price,
    duration: el.duration,
    guarantee_time: el.guarantee_time,
    UserId: el.userId,
  };
});

module.exports = { needMap };
