import React from 'react'
import "./style.css"
import { SignInBtn } from '../../components'
import { useContext, useState } from 'react';
import {UserContext} from "../../contexts/user"
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'
import makeid from "../../helper/functions"
import { db, storage } from '../../firebase';
import firebase from "firebase"
export default function CreatePost() {
    const [user, setUser] = useContext(UserContext).user
    const [caption, setCaption] = useState("");
    const[image, setImage] = useState(null);
    const [progress, setProgress] = useState(0)
    const handleChange = (e) =>{
        if(e.target.files[0]){
            setImage(e.target.files[0]);

            var selectedImageSrc = URL.createObjectURL(e.target.files[0]);

            var imagePreview = document.getElementById("image-preview");
            imagePreview.src = selectedImageSrc;

            imagePreview.style.display = "block";

        }
    }
    const handleUpload = () =>{
        if(image){
            var imageName = makeid(10)
            const uploadTask = storage.ref(`images/${imageName}.jpg`)
            .put(image)

            uploadTask.on("state_changed", (snapshot)=>{
                
                const progress = Math.round((snapshot.bytesTransferred/snapshot.totalBytes) * 100)

                setProgress(progress);
            }, (error) =>{
                console.log(error);
            },
            () =>{
                storage.ref("images").child(`${imageName}.jpg`)
                .getDownloadURL()
                .then((url) => {
                     db.collection("posts").add({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        caption: caption,
                        username: user.email.replace("@gmail.com", ""),
                        photoUrl: url
                        
                    })

                }) 
                setCaption("")
                setProgress(0)
                setImage(null)
            }
            
            )
        }

    }
    return (
        <div className="createPost">
            {user ? (<div className ="createPost__loggedIn">
                <p> Create Post</p>
                <div className="createPost__loggedInCenter">
                    <textarea className = "createPost__textArea"
                    rows ="3"
                    placeholder ="Enter caption here..."
                    value={caption}
                    onChange={(e)=>setCaption(e.target.value)}
                    >    
                    </textarea>
                    <div className ="createPost__imagePreview">
                        <img id="image-preview" alt="" />
                        </div>
                        
                </div>
             <div className="createPost_loggedInBottom">
             <div className="createPost__imageUpload">
                    <label htmlFor="fileInput">
                <AddAPhotoIcon style ={{cursor: "pointer" }}/>
                </label>
                <input id ="fileInput" type ="file" accept ="image/*" onChange={handleChange}/>

                </div>
                <button className = "createPost__uploadButton" onClick={handleUpload} style ={{color: caption ? "#000" : "lightgray'"}}>
                    {`Upload ${progress !== 0 ? progress : ""}`}
                </button>
             </div>

                </div>) : (
            <div>
            <SignInBtn />
            <p style={{marginLeft: "12px"}}> to Post or Comment</p>
            </div>
            )}
            
        </div>
    )
}
