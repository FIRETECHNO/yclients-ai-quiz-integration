import { ChatInput } from "#components";
import { toast } from "vue3-toastify";
import ChatApi from "~/api/ChatApi";

export function useChat() {
  let messages = useState<IMessage[]>(() => []);
  let chatStatus = useState<"ready" | "ai-thinking">("ready");
  let hints = useState<string[]>(() => []);
  // Создаем ref для отслеживания состояния загрузки.
  // Это полезно, чтобы показывать пользователю спиннер или лоадер.
  const isLoadingHistory = ref(false);

  const fetchHistory = async () => {
    console.log("Запускаем загрузку истории сообщений...");

    // Получаем необходимые ID из других composables.
    // .value нужен, чтобы получить само значение из ref-переменной.

    // Ставим флаг загрузки в true. В этот момент на UI можно показать лоадер.
    isLoadingHistory.value = true;
    try {
      let initialHistory = await ChatApi.getHistory();

      // Проверяем, что история вообще есть
      if (!initialHistory || initialHistory.length === 0) {
        console.log("История пуста, обновлять нечего.");
        messages.value = []; // Очищаем сообщения на всякий случай
        return; // Выходим из функции
      }

      console.log(
        `Получена история из ${initialHistory.length} сообщений. Обогащаем данными...`
      );

      // 1. Создаем массив ПРОМИСОВ.
      // Мы проходимся по каждому сообщению в истории и для каждого
      // создаем "обещание" (промис) обогатить его данными.
      const enrichedHistoryPromises = initialHistory.map(async (message) => {
        // Проверяем, есть ли что обогащать
        if (message.payload && message.payload.recommended_services) {
          // Асинхронно получаем дополнительные данные (услуги)
          const services = await ChatApi.getServicesById(
            message.payload.recommended_services
          );

          // ВАЖНО: Мы возвращаем НОВЫЙ ОБЪЕКТ.
          // Мы копируем все старые поля из `message` с помощью `...message`
          // и добавляем/перезаписываем поле `payload` с новыми данными.
          return new Message(
            message.role,
            message.content,
            {
              recommended_services: message.payload.recommended_services,
              services: services,
            },
            message.isIncoming,
            message.author,
            message._id
          );
        }

        // Если в сообщении нечего обогащать, просто возвращаем его как есть.
        return message;
      });

      // 2. Ждем выполнения ВСЕХ промисов параллельно.
      // Promise.all - это как сказать: "Запусти все эти задачи одновременно
      // и дай мне знать, когда самая последняя из них будет выполнена".
      const finalHistory = await Promise.all(enrichedHistoryPromises);
      console.log(finalHistory);
      // 3. Присваиваем наш НОВЫЙ, полностью готовый массив.
      // Vue видит, что это совершенно новый массив (новая ссылка),
      // и гарантированно перерисовывает компонент.
      messages.value = finalHistory;
    } catch (error) {
      console.error("Ошибка загрузки истории:", error);
      messages.value = [];
    } finally {
      isLoadingHistory.value = false;
    }
  };

  async function sendMessage(question: string) {
    if (question.length == 0) return;

    const { user } = useUser();
    const { companyId } = useCompany();

    if (!companyId.value) throw new Error("Не выбрана компания!");

    let messageOnClient = new Message(
      "user",
      question,
      { services: [], recommended_services: [] },
      false,
      user.value?.id
    );
    messages.value.push(messageOnClient);
    ChatApi.saveMessage(messageOnClient, companyId.value, user.value.id);
    try {
      chatStatus.value = "ai-thinking";
      let data = await ChatApi.askAi(messageOnClient, companyId.value);
      const recommended_services = await ChatApi.getIdServices(
        user.value.id,
        companyId.value
      );
      setAiMessage(data.output, recommended_services);

      chatStatus.value = "ready";

      return data;
    } catch (error: any) {
      chatStatus.value = "ready";
      return toast(error.message, {
        type: "error",
      });
    }
  }

  async function setHints() {
    const { user } = useUser();
    const { companyId } = useCompany();
    if (!companyId.value) throw new Error("Не выбрана компания!");
    try {
      chatStatus.value = "ai-thinking";
      // companyId.value! возможно неправильно
      let data = await ChatApi.getHints(user.value.id, companyId.value!);
      hints.value = data.hints;

      chatStatus.value = "ready";
    } catch (error: any) {
      chatStatus.value = "ready";
      return toast(error.message, {
        type: "error",
      });
    }
  }
  async function getService(serviceId: number): Promise<any> {
    return await ChatApi.getServiceById(serviceId);
  }
  async function setAiMessage(answer: string, payload: any) {
    let messageFromAI = new Message("assistant", answer, payload, true, -1);
    //?
    const { user } = useUser();
    const { companyId } = useCompany();
    if (!companyId.value) throw new Error("Не выбрана компания!");

    ChatApi.saveMessage(messageFromAI, companyId.value, user.value.id);
    messageFromAI.payload.services = await ChatApi.getServicesById(
      messageFromAI.payload.recommended_services
    );
    messages.value.push(messageFromAI); // insert a new message
    chatStatus.value = "ready";
  }
  return {
    // variables
    messages,
    hints,
    chatStatus,
    isLoadingHistory,
    // functions
    sendMessage,
    setAiMessage,
    fetchHistory,
    setHints,
    getService,
  };
}
