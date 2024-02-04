const users = [];

// Add user , remove user , getUser , getRoomUsers

const addUser = ({id , username , room})=>{
    // Clean the data 
    username  = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if(!username || !room){
        return {
            error:"Username and Room are required."
        }
    }

    // Check if the user is exist 
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username;
    })

    if(existingUser){
        return {
            error : "Username is already in use"
        }
    }

    // Add user to users array
    const user = {id , username , room}
    users.push(user);

    return {user};
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id;
    })

    if(index !== -1){
        return users.splice(index , 1)[0];
    }
}

const getUser = (id)=>{
    const user = users.find((user)=>{
        return user.id === id;
    })

    if(!user){
        return {
            error:"User is not found"
        }
    }

    return {user};
}

const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase();
    const usersInRoom = users.filter((user)=>{
        return user.room === room;
    })

    if(!usersInRoom){
        return [];
    }
    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}