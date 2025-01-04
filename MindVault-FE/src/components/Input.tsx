
interface InputProps{
     placeholder:string; 
     reference?: any; 
}

export function Input({placeholder,reference }: InputProps) {
    return <div>
        <input ref={reference} placeholder={placeholder} className="border rounded px-4 py-2 m-2"></input>

    </div>
}