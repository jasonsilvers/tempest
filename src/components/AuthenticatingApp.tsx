import 'twin.macro';

const LoginLoader = () => {
  return (
    <div tw="text-primary flex flex-col space-y-10 items-center">
      <h3 tw="text-5xl">Welcome to Cascade!</h3>
      <svg width="120" height="30" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg" fill="#fff">
        <circle fill="currentColor" cx="15" cy="15" r="15">
          <animate
            attributeName="r"
            from="15"
            to="15"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            from="1"
            to="1"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle fill="currentColor" cx="60" cy="15" r="9" fillOpacity="0.3">
          <animate
            attributeName="r"
            from="9"
            to="9"
            begin="0s"
            dur="0.8s"
            values="9;15;9"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            from="0.5"
            to="0.5"
            begin="0s"
            dur="0.8s"
            values=".5;1;.5"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle fill="currentColor" cx="105" cy="15" r="15">
          <animate
            attributeName="r"
            from="15"
            to="15"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            from="1"
            to="1"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <p tw="text-base">Please give us a moment while we gather your things...</p>
    </div>
  );
};

export const AuthenticatingApp = () => {
  return (
    <div>
      <main tw="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
        <LoginLoader />
      </main>
    </div>
  );
};
