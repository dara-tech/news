import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

async function testAuthorAPI() {
  try {
    console.log('Testing Author API endpoint...');
    
    // First, let's get some news to find an author ID
    const newsResponse = await axios.get(`${API_URL}/news`);
    console.log('News response status:', newsResponse.status);
    
    if (newsResponse.data.success && newsResponse.data.news.length > 0) {
      const firstArticle = newsResponse.data.news[0];
      const authorId = firstArticle.author._id;
      
      console.log('Found author ID:', authorId);
      
      // Now test the author profile endpoint
      const authorResponse = await axios.get(`${API_URL}/news/author/${authorId}`);
      console.log('Author API response status:', authorResponse.status);
      console.log('Author data:', JSON.stringify(authorResponse.data, null, 2));
      
    } else {
      console.log('No articles found to test with');
    }
    
  } catch (error) {
    console.error('Error testing author API:', error.response?.data || error.message);
  }
}

testAuthorAPI(); 