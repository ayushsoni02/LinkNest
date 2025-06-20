// import React from 'react';

// interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

//  interface InputProps{
//       placeholder:string; 
//       reference?: any; 
//  }

// const Input = React.forwardRef<HTMLInputElement,React.InputHTMLAttributes<HTMLInputElement>>(
//   ({ className = '', type = 'text', ...props }, ref) => {
//     return (
//       <input
//         type={type}
//         className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
//         ref={ref}
//         {...props}
//       />
//     );
//   }
// );
// Input.displayName = 'Input';

// export { Input };

interface InputProps{
     placeholder:string; 
     reference?: any; 
     type?: string;
}

export function Input({placeholder,reference,type }: InputProps) {
    return <input 
ref={reference} placeholder={placeholder} type={type} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

 
}


// type MyInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
//   reference: React.RefObject<HTMLInputElement>;
// };

// export const Input = ({ reference, ...props }: MyInputProps) => {
//   return (
//     <input
//       ref={reference}
//       {...props}
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//     />
//   );
// };