import * as admin from "firebase-admin";

const subscribeToTopic = async (token: string, topic: string) => {
  try {
    await admin.messaging().subscribeToTopic([token], topic);
    console.log(`Successfully subscribed ${token} to ${topic}`);
  } catch (error) {
    console.error(`Error subscribing ${token} to ${topic}:`, error);
  }
};

const unsubscribeFromTopic = async (token: string, topic: string) => {
  try {
    await admin.messaging().unsubscribeFromTopic([token], topic);
    console.log(`Successfully unsubscribed ${token} from ${topic}`);
  } catch (error) {
    console.error(`Error unsubscribing ${token} from ${topic}:`, error);
  }
};

interface PushNotiProps {
  to: string;
  title: string;
  body: string;
  categorygory: string;
  catvaluelue: string;
}

const PushNoti = async (props: PushNotiProps) => {
  try {
    const messaging = admin.messaging();

    const message = {
      data: {
        title: props.title,
        body: props.body,
      },
      token: props.to,
    };

    const topic_message = {
      data: {
        title: props.title,
        body: props.body,
      },
      topic: props.categorygory,
    };

    const year_message = {
      data: {
        title: props.title,
        body: props.body,
      },
      topic: props.catvaluelue,
    };

    if (
      props.categorygory.slice(0, 4) === "news" ||
      props.categorygory === "announcement"
    ) {
      const response = await messaging.send(topic_message);
      console.log("Successfully sent message:", response);
      return response;
    } else if (props.categorygory === "year") {
      const response = await messaging.send(year_message);
      console.log("Successfully sent message:", response);
      return response;
    } else {
      const response = await messaging.send(message);
      console.log("Successfully sent message:", response);
      return response;
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export = { subscribeToTopic, unsubscribeFromTopic, PushNoti };
