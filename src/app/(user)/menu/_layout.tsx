
import { Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { Link } from 'expo-router'; 



export default function MenuStack() {
    return (
<Stack 
screenOptions={{
    headerRight: () => (
        <Link href="/cart" asChild>
          <Pressable>
            {({ pressed }) => (
              <FontAwesome
                name="shopping-cart"
                size={25}
                color={Colors.light.tint}
                style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        </Link>
      ),


}} > 
    <Stack.Screen name='index' options={{title:'La Place Menu'}} />
</Stack>
    ) ;
}