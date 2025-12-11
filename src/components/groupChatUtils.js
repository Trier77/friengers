import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Tilføjer en bruger til en eksisterende gruppechat hvis den findes
 * @param {string} postId - ID på det opslag som gruppechatten tilhører
 * @param {string} userId - ID på brugeren der skal tilføjes
 * @returns {Promise<boolean>} - true hvis brugeren blev tilføjet, false hvis gruppechat ikke findes
 */
export const addUserToGroupChat = async (postId, userId) => {
  try {
    const groupChatId = `group_${postId}`;
    const groupChatRef = doc(db, "chats", groupChatId);

    const groupChatSnap = await getDoc(groupChatRef);

    if (groupChatSnap.exists()) {
      await updateDoc(groupChatRef, {
        participants: arrayUnion(userId),
      });
      console.log(`✅ Bruger ${userId} tilføjet til gruppechat ${groupChatId}`);
      return true;
    } else {
      console.log(`⚠️ Gruppechat ${groupChatId} findes ikke endnu`);
      return false;
    }
  } catch (error) {
    console.error("❌ Fejl ved tilføjelse til gruppechat:", error);
    return false;
  }
};
