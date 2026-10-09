const seedBatch = 'us-roommates-v1';
const password = '123456789';
const people = [
  ['Ava', 'Bennett'], ['Noah', 'Carter'], ['Mia', 'Brooks'], ['Liam', 'Foster'],
  ['Sophia', 'Reed'], ['Ethan', 'Hayes'], ['Olivia', 'Morgan'], ['Lucas', 'Parker'],
  ['Isabella', 'Price'], ['Mason', 'Turner'], ['Amelia', 'Collins'], ['Logan', 'Ward'],
  ['Harper', 'Mitchell'], ['James', 'Cooper'], ['Evelyn', 'Richardson'], ['Benjamin', 'Sullivan'],
  ['Charlotte', 'Ramirez'], ['Elijah', 'Rivera'], ['Aria', 'Peterson'], ['Oliver', 'Griffin'],
  ['Grace', 'Sanders'], ['Henry', 'Bishop'], ['Nora', 'Coleman'], ['Jackson', 'Bryant'],
  ['Chloe', 'Henderson'], ['Daniel', 'Russell'], ['Lily', 'Watson'], ['Sebastian', 'Ortiz'],
  ['Zoe', 'Kim'], ['Caleb', 'Nguyen'],
];
const places = [
  ['New York', 'NY', 'New York University', 1600],
  ['Los Angeles', 'CA', 'University of California, Los Angeles', 1400],
  ['Chicago', 'IL', 'University of Illinois Chicago', 950],
  ['Austin', 'TX', 'University of Texas at Austin', 1000],
  ['Seattle', 'WA', 'University of Washington', 1300],
  ['Boston', 'MA', 'Boston University', 1500],
  ['Denver', 'CO', 'University of Denver', 1150],
  ['Atlanta', 'GA', 'Georgia State University', 900],
  ['San Diego', 'CA', 'San Diego State University', 1350],
  ['Philadelphia', 'PA', 'Temple University', 950],
  ['Portland', 'OR', 'Portland State University', 1050],
  ['Miami', 'FL', 'Florida International University', 1200],
  ['Minneapolis', 'MN', 'University of Minnesota', 850],
  ['Raleigh', 'NC', 'North Carolina State University', 850],
  ['Phoenix', 'AZ', 'Arizona State University', 900],
];
const interests = ['cooking and weekend hikes', 'music and board games', 'reading and coffee shops', 'fitness and movie nights', 'photography and travel', 'cycling and quiet evenings'];
const localPhotos = {
  0: 'cld-sample.jpg',
  1: 'man-on-a-street.jpg',
  3: 'man-portrait.jpg',
  5: 'smiling-man.jpg',
  7: 'upscale-face-1.jpg',
};
const profiles = people.map(([first, last], index) => {
  const [city, state, university, baseBudget] = places[index % places.length];
  return {
    name: `${first} ${last}`,
    email: `${first[0].toLowerCase()}${last.toLowerCase()}@${index % 2 ? 'hotmail' : 'gmail'}.com`,
    city, state, university,
    country: 'United States',
    budget: baseBudget + (index >= places.length ? 100 : 0),
    smoking: false,
    pets: index % 4 === 0,
    furniture: index % 3 !== 0,
    lookingFor: 'roommate',
    aboutMe: `Demo profile. I'm ${first}, looking for a roommate in ${city}, ${state}. I enjoy ${interests[index % interests.length]} and value a tidy home, shared chores, and considerate communication.`,
    localPhoto: localPhotos[index],
    photoSource: localPhotos[index] ? `mobile/Profiles/${localPhotos[index]}` : `https://randomuser.me/api/portraits/${index % 2 ? 'men' : 'women'}/${20 + index}.jpg`,
  };
});
module.exports = { seedBatch, password, profiles };
