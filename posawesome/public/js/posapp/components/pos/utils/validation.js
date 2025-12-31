export function customerNameRules(minLen=3){
    return[
        (v)=>{
            if(v===null || v===undefined || v===''){
                return__('Customer name is required');
            }

            const value=String(v).trim();
            if(!value.length){
                return__('Customer name is required');
            }
            if(value.length<minLen){
                return `Customer name must be at least ${minLen} characters long`;
            }
            return true;
        },
    ];
}


export function mobileNumeberRules(length=10){
    return [
        (v)=>{
            if(v===null || v===undefined || String(v).trim()===''){
                return true;
        }
        const value=String(v).trim();

        if(!/^[6-9]\d{9}$/.test(value)){
            return __('Mobile number must contain only 10 digits and start with 6,7,8 or 9');
        }

        if(value.length!=length){
            return `Mobile number must be exactly ${length} digits long`;
        }

        return true;
    }
    ];

}

export function emailRules(){
    return [
        (v)=>{
            if(v===null || v===undefined || String(v).trim()===''){
                return true;
            }
            const value=String(v).trim();

            const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(value)){
                return __('Please enter a valid email address');
            }
            return true;
        },
    ];
}

export function requiredRules(label='This field'){
    return [
        (v)=>{
            if(v===null || v===undefined || String(v).trim()===''){
                return `${label} is required`;
            }
            return true;
        },
    ];
}