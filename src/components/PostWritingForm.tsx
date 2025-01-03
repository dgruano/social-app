import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const PostWritingForm = () => {
  const [postContent, setPostContent] = useState('');

  const handlePostSubmit = () => {
    // Logic to handle post submission
    console.log('Post submitted:', postContent);
    setPostContent('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={postContent}
        onChangeText={setPostContent}
      />
      <Button title="Post" onPress={handlePostSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default PostWritingForm;
