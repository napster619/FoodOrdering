import { useEffect, useState } from "react"; 
import { View, Text, StyleSheet, TextInput, Image,Alert } from "react-native";
import Button from "@/components/Button";
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams,useRouter } from "expo-router";
import { useInsertProduct,useUpdateProduct,useProduct, useDeleteProduct } from "@/api/products";
import * as FileSystem from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';


const CreateProductScreen = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState('');
const[image,setImage]=useState<string|null>(null);

const {id:idString}=useLocalSearchParams();
const id =parseFloat(typeof idString =='string' ? idString:idString?.[0]);

    const isUpdating=!!idString;

const{mutate:insertProduct}=useInsertProduct();
const{mutate:updateProduct}=useUpdateProduct();
const{data:updatingProduct}=useProduct(id);
const{mutate:deleteProduct}=useDeleteProduct();

console.log(updatingProduct);

const router=useRouter();

useEffect(()=>{
  if(updatingProduct){
    setName(updatingProduct.name);
    setPrice(updatingProduct.price.toString());
    setImage(updatingProduct.image);
  }
},[updatingProduct]);


  const resetFields = () => {
    setName("");
    setPrice("");
  };

  const validateInput = () => {
    setErrors('');
    if (!name) {
      setErrors('Name is required');
      return false;
    }
    if (!price) {
      setErrors('Price is required');
      return false;
    }
    if (isNaN(parseFloat(price))) {
      setErrors('Price must be a valid number');
      return false;
    }
    return true;
  };
const onSubmit=()=>{
if(isUpdating){
    onUpdate();
}else{
    onCreate();
}
};





const onDelete=()=>{
  deleteProduct(id,{
    onSuccess:()=>{
    resetFields();
    router.replace('/(admin)');
  },
});
};





const confirmDelete=()=>{
Alert.alert('Confirm','Are you sure you want to delete this product',[
  {
    text:'Cancel',
  },
  {
    text:'Delete',
    style:'destructive',
    onPress:onDelete,
  },
]);
};

  const onCreate = async() => {
    if (!validateInput()) {
      return;
    }

    const imagePath=await uploadImage();
    // console.warn("Creating product", name);

    insertProduct({name,price:parseFloat(price),image:imagePath},
{
      onSuccess:()=>{
        resetFields();
        router.back();
      },
    
    }
  );

  };

  const onUpdate =async () => {
    if (!validateInput()) {
      return;
    }
    const imagePath=await uploadImage();



updateProduct(
  {id,name,price:parseFloat(price),image:imagePath},
  {
    onSuccess:()=>{
      resetFields();
      router.back();
    },
  
  }
);
  };


  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    console.log(result);
  
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  const uploadImage = async () => {
    if (!image?.startsWith('file://')) {
      return;
    }




  
    const base64 = await FileSystem.readAsStringAsync(image, {
      encoding: 'base64',
    });
    const filePath = `${randomUUID()}.png`;
    const contentType = 'image/png';
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, decode(base64), { contentType });
  
console.log(error)

    if (data) {
      return data.path;
    }
  };



  return (
    <View style={styles.container}>
        <Stack.Screen options={{title:isUpdating ? 'Update Product' : 'Create Product'}}/>
      <Image
        source={{ uri: image||'https://clipart-library.com/images_k/food-clipart-transparent/food-clipart-transparent-11.png' }}
        style={styles.image}
      />
      <Text onPress={pickImage} style={styles.textButton}>Select Image</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        placeholder="Name"
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Price (MYR)</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="9.99"
        style={styles.input}
        keyboardType="numeric"
      />
      {errors ? <Text style={styles.errorText}>{errors}</Text> : null}
      <Button onPress={onSubmit} text={isUpdating?"Update" : "Create"} />
      {isUpdating && <Text onPress={confirmDelete} style={styles.textButton}>Delete</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  textButton: {
    alignSelf: 'center',
    fontWeight: 'bold',
    color: '#007AFF', // Replace Colors.light.tint with a direct color code
    marginVertical: 10,
  },
  image: {
    width: '50%',
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: 50,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  label: {
    color: "gray",
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default CreateProductScreen;
