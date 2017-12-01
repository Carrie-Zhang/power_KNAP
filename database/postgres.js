require('dotenv').config();
const Sequelize = require('sequelize');

let params = {};
if (!process.env.LOCAL) { params = { dialect: 'postgres', protocol: 'postgres', logging: false, dialectOptions: { ssl: true } }; }
const sequelize = new Sequelize(process.env.DATABASE_URL, params);

sequelize.authenticate()
  .then(() => console.log('Connection has been established successfully'))
  .catch(err => console.error('Unable to connect to database:', err));

const Videos = sequelize.define('videos', {
  videoName: Sequelize.STRING,
  creator: Sequelize.STRING,
  url: Sequelize.STRING,
  description: Sequelize.STRING,
  thumbnail: Sequelize.STRING,
});

const Users = sequelize.define('users', {
  fbId: Sequelize.STRING,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
});

// const Playlist = sequelize.define('playlist', {
//   playlistName: Sequelize.STRING,
// });

// TODO we will need to refer to the Room ID when there are multiple room instances
const Rooms = sequelize.define('rooms', {
  indexKey: Sequelize.INTEGER,
  startTime: Sequelize.DATE,
  roomName: Sequelize.STRING,
  isPrivate: Sequelize.BOOLEAN,
});

const UsersRooms = sequelize.define('users_rooms', {});


// Users.sync({ force: true });
// Rooms.sync({ force: true });

UsersRooms.belongsTo(Users);
UsersRooms.belongsTo(Rooms);
Videos.belongsTo(Rooms);

// Videos.sync({ force: true });
// UsersRooms.sync({ force: true });


const createVideoEntry = (videoData) => {
  const videoEntry = {
    videoName: videoData.title,
    creator: videoData.creator,
    url: videoData.url,
    description: videoData.description,
  };
  return Videos.create(videoEntry); // returns a promise when called
};

// Room Queries
const getRoomProperties = () => Rooms.findById(1).then(room => room.dataValues);
const incrementIndex = () => Rooms.findById(1).then(room => room.increment('indexKey'));
const resetRoomIndex = () => Rooms.findById(1).then(room => room.update({ indexKey: 0 }));
const getIndex = () => Rooms.findById(1).then(room => room.dataValues.indexKey);
const setStartTime = () => Rooms.findById(1).then(room => room.update({ startTime: Date.now() }));
const getRoomNames = () => Rooms.findAll();

// Video Queries
const findVideos = () => Videos.findAll();
const removeFromPlaylist = title => Videos.find({ where: { videoName: title } }).then(video => video.destroy());

exports.createVideoEntry = createVideoEntry;
exports.getRoomProperties = getRoomProperties;
exports.incrementIndex = incrementIndex;
exports.resetRoomIndex = resetRoomIndex;
exports.getIndex = getIndex;
exports.setStartTime = setStartTime;
exports.findVideos = findVideos;
exports.removeFromPlaylist = removeFromPlaylist;
exports.getRoomNames = getRoomNames;
