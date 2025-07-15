const renderTasksProgressData = (tasks) => {
    let tasksProgress;
    const tasksProgressDOM = document.getElementById('tasks-progress');

    if(tasksProgressDOM) tasksProgress = tasksProgressDOM;
    else{
        const newtasksProgressDOM = document.createElement('div');
        newtasksProgressDOM.id = 'tasks-progress';
        document.getElementsByTagName('footer')[0].appendChild(newtasksProgressDOM);
        tasksProgress = newtasksProgressDOM;
    }

    const doneTasks = tasks.filter(({checked}) => checked).length
    const totalTasks = tasks.length;
    tasksProgress.textContent = `${doneTasks}/${totalTasks} concluídas`
}


const getTasksFromLocalStorage = () => {
    const localTasks = JSON.parse(window.localStorage.getItem('tasks'))
    return localTasks ? localTasks : [];
}


const setTasksInLocalStorage = (tasks) =>{
    window.localStorage.setItem('tasks', JSON.stringify(tasks));

}


const removeDoneTasks = () => {
    const tasks = getTasksFromLocalStorage()
    const tasksToRemove = tasks
    .filter(({checked}) => checked)
    .map(({id }) => id)

    const updatedTasks = tasks.filter(({checked}) => !checked);
    setTasksInLocalStorage(updatedTasks)
    renderTasksProgressData(updatedTasks)

    tasksToRemove.forEach((tasksToRemove) => {
        document
        .getElementById("todo-list")
        .removeChild(document.getElementById(tasksToRemove))
    })
}

const createTaskListItem = (task) => {
  const list = document.getElementById('todo-list');
  const toDo = document.createElement('li');
  toDo.id = task.id;

  const leftContent = document.createElement('div');
  leftContent.classList.add('tarefa-conteudo');

  const nome = document.createElement('span');
  nome.textContent = task.description;

  const etiqueta = document.createElement('etiqueta');
  etiqueta.textContent = task.etiqueta || '';
  etiqueta.classList.add('etiqueta-texto');

  const data = document.createElement('small');
  data.textContent = `Criado em: ${task.data || 'Sem data'}`;
  data.classList.add('data-texto');

  leftContent.appendChild(nome);
  const infoLine = document.createElement('div');
  infoLine.classList.add('info-line');

  infoLine.appendChild(etiqueta);
  infoLine.appendChild(data);

  leftContent.appendChild(nome);
  leftContent.appendChild(infoLine);


  toDo.appendChild(leftContent);

  const rightContent = document.createElement('div');
  rightContent.classList.add('tarefa-botao');

  const completeTaskButton = document.createElement('button');
  completeTaskButton.textContent = 'Concluir';
  completeTaskButton.classList.add('add-task-btn');
  completeTaskButton.ariaLabel = 'Marcar como concluída';

  const createDoneImage = () => {
    const image = document.createElement('img');
    image.src = 'img.svg';
    image.alt = 'Tarefa concluída';
    image.classList.add('tarefa-imagem');

    image.onclick = () => {
      toDo.classList.remove('completed');

      const revertedTasks = getTasksFromLocalStorage().map((x) =>
        x.id === task.id ? { ...x, checked: false } : x
      );
      setTasksInLocalStorage(revertedTasks);
      renderTasksProgressData(revertedTasks);

      rightContent.replaceChildren(completeTaskButton);
    };

    return image;
  };

  completeTaskButton.onclick = () => {
    toDo.classList.add('completed');

    const tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.map((x) =>
      x.id === task.id ? { ...x, checked: true } : x
    );
    setTasksInLocalStorage(updatedTasks);
    renderTasksProgressData(updatedTasks);

    rightContent.replaceChildren(createDoneImage());
  };

  if (task.checked) {
    toDo.classList.add('completed');
    rightContent.appendChild(createDoneImage());
  } else {
    rightContent.appendChild(completeTaskButton);
  }

  toDo.appendChild(rightContent);
  list.appendChild(toDo);

  return toDo;
};



const onCheckboxClick = (event) =>{
    const [id] = event.target.id.split('-');
    const tasks = getTasksFromLocalStorage();
    
    const updatedTasks = tasks.map((task) => {
        return parseInt(task.id) === parseInt(id) 
        ?  {...task, checked: event.target.checked }
        : task
    })
    setTasksInLocalStorage(updatedTasks)
    renderTasksProgressData(updatedTasks)
}


const getCheckboxInput = ({id, description, checked}) => {
    const checkbox = document.createElement('input');
    const label = document.createElement('label');
    const wrapper = document.createElement('div');

    label.textContent = description;

    wrapper.appendChild(label);

    return wrapper;
}


const getNewTaskId = () =>{
    const tasks = getTasksFromLocalStorage()
    const lastId = tasks [tasks.length -1] ?.id;
    return lastId ? lastId + 1 : 1;
}


const getNewTaskData = (event) => {
  const description = event.target.elements.tarefa.value;
  const etiqueta = event.target.elements.etiqueta.value;
  const data = new Date().toLocaleDateString('pt-BR'); 
  const id = getNewTaskId();

  return { description, etiqueta, data, id };
};


const getCreatedTaskInfo = (event) => new Promise((resolve) => {
    setTimeout (() => {
        resolve(getNewTaskData(event))
    }, 1000)
    
})


const createTask = async (event) => {
    event.preventDefault();
    document.getElementById('save-task').setAttribute('disabled', false)
    const newTaskData = await getCreatedTaskInfo(event);

    createTaskListItem(newTaskData);

    const tasks = getTasksFromLocalStorage()
    const updatedTasks = [
  ...tasks,
  {
    id: newTaskData.id,
    description: newTaskData.description,
    etiqueta: newTaskData.etiqueta,
    data: newTaskData.data,
    checked: false
  }
];
    
    setTasksInLocalStorage(updatedTasks)
    renderTasksProgressData(updatedTasks)

    document.getElementById('tarefa').value = ''
    document.getElementById('etiqueta').value = '';

    document.getElementById('save-task').removeAttribute('disabled')

}


window.onload = function() {
    const form = document.getElementById('create-todo-form');
    form.addEventListener('submit', createTask);

    let tasks = getTasksFromLocalStorage();

    if (tasks.length === 0) {
        const fixedTasks = [
            {
                id: 1,
                description: 'Estudar',
                etiqueta: 'Rotina',
                data: new Date().toLocaleDateString('pt-BR'),
                checked: false
            },
            {
                id: 2,
                description: 'Fazer alongamento',
                etiqueta: 'Saúde',
                data: new Date().toLocaleDateString('pt-BR'),
                checked: false
            }
        ];

        tasks = fixedTasks;
        setTasksInLocalStorage(tasks);
    }

    tasks.forEach((task) => {
        createTaskListItem(task);
    });

    renderTasksProgressData(tasks);
}
