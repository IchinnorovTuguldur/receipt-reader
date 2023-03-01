import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Button,
  Image,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import EditToDB from "./EditToDB";
import * as ImagePicker from "expo-image-picker";
import { ImageEditor } from "expo-image-editor";
import Ionicons from "@expo/vector-icons/Ionicons";
import Torch from "react-native-torch";
import React from "react";
import fetch from 'node-fetch';
import Icon from "react-native-vector-icons/FontAwesome";
import { uploadReceipt } from '../functions/bucketFun';
export default function App({ route, navigation }) {
  const userParams = route.params;
  
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();

  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);

  // const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.torch)

  const [imageUri, setImageToBeCroppedUri] = useState(undefined);
  const [editorVisible, setEditorVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>;
  } else if (!hasCameraPermission) {
    return (
      <Text>
        Permission for camera not granted. Please change this in settings.
      </Text>
    );
  }

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false,
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });


    //UPLOADS TO STORAGE **********
    //const storageName= "example12"
    setPhoto(result)
    let urlSupa = await uploadReceipt(result, userParams.userid);
    alert(urlSupa)
    //************ JACOB WHERE DOES THIS GO?? */

    // if (!result?.canceled) {
    //   launchEditor(result.uri);
    // }
    
    // get secure url from our server 
    // const { url } = await fetch("http://localhost:8080/s3Url").then((res) =>
    //   res.json()
    // );
    // const response = await fetch(result.assets[0].uri);
    // const blob = await response.blob();
    // console.log(url, blob, blob.type);
    // // post the image direclty to the s3 bucket
    // const response2 = await fetch(url, {
    //   method: "PUT",
    //   body: blob,
    // });
    // console.log(response2);
    
  };
/*
  //function to launch the image editor
  const launchEditor = (uri) => {
    // Then set the image uri
    setImageToBeCroppedUri(uri);
    // And set the image editor to be visible
    setEditorVisible(true);
  };

  if(imageUri){
    return (
      <View>
       <Image
        style={{ height: 300, width: 300 }}
        source={{ imageUri }}
      />
          <ImageEditor
            visible={editorVisible}
            onCloseEditor={() => {
              //todo
              // When the editor is closed, set the editor to be invisible and display the camera screen
            }}
            imageUri={imageUri}
            fixedCropAspectRatio={9 / 16}
            mode="crop-only"
            lockAspectRatio={false}
            minimumCropDimensions={{
              width: 100,
              height: 100,
            }}
            onEditingComplete={(image) => {
              // When the image is cropped
              setPhoto(image)
              setImageToBeCroppedUri(null)
            }}
          />
        
      </View>
    );
  }
*/
  if (photo) {
    let savePhoto = async () => {
      let url = await uploadReceipt(photo, userParams.userid)
      //alert(url)
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        //pass to the OCR that returns receipt data based off url

      const sendImageToOcr = async () => {

        const response = await fetch('http://localhost:3000', {
            method: 'POST',
            body: JSON.stringify( { "url": url } ),
            headers: { 'Content-Type': 'application/json' }
            
        });
        const data = await response.json();
    
        return data;
      }
      
      let receiptData = sendImageToOcr();

      navigation.replace("EditToDB", {userid: userParams.userid, receiptData: receiptData});

      })};

    return (
      <SafeAreaView style={styles.container}>
        <Image
          style={styles.preview}
          source={{ uri: "data:image/jpg;base64," + photo.base64 }}
        />
        {hasMediaLibraryPermission ? (
          <Button title="Save/Upload" onPress={savePhoto} />
        ) : undefined}
        <Button title="Re-take" onPress={() => setPhoto(undefined)} />
        <Button title="Crop" onPress={() => launchEditor(photo.uri)} />
      </SafeAreaView>
    );
  }

  return (
    <Camera style={styles.container} ref={cameraRef} flashMode={flash}>
      <View style={styles.flash}>
        <Icon.Button
          name="flash"
          size={30}
          onPress={() =>
            setFlash(
              flash === Camera.Constants.FlashMode.off
                ? Camera.Constants.FlashMode.torch
                : Camera.Constants.FlashMode.off
            )
          }
          color={flash === Camera.Constants.FlashMode.off ? "gray" : "#fff"}
        ></Icon.Button>
      </View>
      <View style={{
        alignSelf: 'center',
        flex: 1,
        alignItems: 'center',
        bottom: 0,
        position: "absolute",
                }}>
        <TouchableOpacity onPress={takePic} style={{
            width: 70,
            height: 70,
            bottom: 0,
            borderRadius: 50,
            backgroundColor: '#fff'
            
            }}
           
       />
       </View>
   
      <View style={styles.buttonContainer2}>
        <Button title="Upload pic" onPress={pickImage} />
      </View>
      <StatusBar style="auto" />
    </Camera>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  buttonContainer: {
    width: 70,
    height: 70,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: "#fff",
    flex: 1,
    position: "absolute",
    alignSelf: "center",
  },
  buttonContainer2: {
    backgroundColor: "#fff",
    // alignSelf: 'left',
    position: "absolute",
    bottom: 0,
  },
  flash: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  preview: {
    alignSelf: "stretch",
    flex: 1,
  },
  titleText: {
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonStyle: {
    justifyContent: "center",
    marginTop: 15,
    padding: 10,
    backgroundColor: "#8ad24e",
    marginRight: 2,
    marginLeft: 2,
  },
  buttonTextStyle: {
    color: "#fff",
    textAlign: "center",
  },
});
