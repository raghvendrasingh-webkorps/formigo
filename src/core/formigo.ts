export interface FormigoConfig<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit?: (values:T) => void
}


export interface FormigoState<T> {
  values : T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean;
}


export function formigo<T extends Object> (config: FormigoConfig<T>) {

  let state  : FormigoState<T> = {
    values: {...config.initialValues},
    errors : {},
    touched : {},
    isSubmitting : false
  }


  type Listener <T> = (state: FormigoState<T>)=> void;
  let listeners : Listener<T>[] = [];

function subscribe(listener: Listener<T>) {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

  function notify (){
    listeners.forEach((listener) => {
      listener(getValues());
    })
  }

  function setValue<K extends keyof T>(field: K, value: T[K]){
    state.values[field] = value;
    runValidation();
    notify();
  }


  function setTouched<K extends keyof T>(field: K){
    state.touched[field] = true;
    runValidation();
    notify();
  }


  function runValidation(){
    if(config.validate) {
      state.errors = config.validate(state.values);
    }else{
      state.errors = {};
    }
  }
  

  function handleSubmit(){
    state.isSubmitting =  true;

    Object.keys(state.values).forEach((key) => {
        state.touched[key as keyof T] = true;
    });

    
    runValidation();
    // notify();

    if(Object.keys(state.errors).length === 0 ) {

      config.onSubmit?.(state.values)

      state.values = {...config.initialValues};
       
    }

    state.isSubmitting = false;
    notify();

  }


  function getValues() {
    return {...state}
  }

  return {
    setValue,
    setTouched,
    handleSubmit,
    getValues,
    subscribe
  }
}


