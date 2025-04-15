type DisplayServerActionResponseProps = {
  result: {
    data?: {
      message?: string;
    };
    serverError?: string;
    validationErrors?: Record<string, string[] | undefined>;
  };
};

const MessageBox = ({
  type,
  content,
}: {
  type: "success" | "error";
  content: React.ReactNode;
}) => {
  return (
    <div
      className={`bg-accent px-4 py-2 my-2 rounded-lg ${
        type === "error" ? "text-red-500" : ""
      }`}
    >
      {type === "success" ? "🎉" : "😿"} {content}
    </div>
  );
};

const DisplayServerActionResponse = ({
  result,
}: DisplayServerActionResponseProps) => {
  const { data, serverError, validationErrors } = result;
  return (
    <div className="z-20 h-20 border">
      {data?.message && <MessageBox type="success" content={data.message} />}
      {serverError && <MessageBox type="error" content={serverError} />}
      {validationErrors && (
        <MessageBox
          type="error"
          content={Object.keys(validationErrors).map((key) => (
            <p key={key}>{`${key}: ${validationErrors[key]}`}</p>
          ))}
        />
      )}
    </div>
  );
};

export default DisplayServerActionResponse;
