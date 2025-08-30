async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadStudents() {
  const rows = document.querySelector('#students-table tbody');
  rows.innerHTML = '';
  try {
    const students = await fetchJSON('/api/students');
    students.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.id}</td><td>${s.name}</td><td>${s.age}</td><td>${s.class}</td><td>
        <button data-id="${s.id}" class="edit">编辑</button>
        <button data-id="${s.id}" class="del">删除</button>
      </td>`;
      rows.appendChild(tr);
    });
  } catch (err) {
    alert('加载失败: ' + err.message);
  }
}

async function addOrUpdate(e) {
  e.preventDefault();
  const id = document.getElementById('student-id').value;
  const name = document.getElementById('name').value.trim();
  const age = Number(document.getElementById('age').value);
  const cls = document.getElementById('class').value.trim();
  try {
    if (id) {
      await fetchJSON('/api/students/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, age, class: cls }) });
    } else {
      await fetchJSON('/api/students', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, age, class: cls }) });
    }
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';
    loadStudents();
  } catch (err) {
    alert('保存失败: ' + err.message);
  }
}

document.getElementById('student-form').addEventListener('submit', addOrUpdate);

document.getElementById('clear').addEventListener('click', () => {
  document.getElementById('student-form').reset();
  document.getElementById('student-id').value = '';
});

document.querySelector('#students-table tbody').addEventListener('click', async (e) => {
  if (e.target.matches('.edit')) {
    const id = e.target.dataset.id;
    const tr = e.target.closest('tr');
    document.getElementById('student-id').value = id;
    document.getElementById('name').value = tr.children[1].textContent;
    document.getElementById('age').value = tr.children[2].textContent;
    document.getElementById('class').value = tr.children[3].textContent;
  }
  if (e.target.matches('.del')) {
    if (!confirm('确认删除？')) return;
    const id = e.target.dataset.id;
    try {
      await fetchJSON('/api/students/' + id, { method: 'DELETE' });
      loadStudents();
    } catch (err) {
      alert('删除失败: ' + err.message);
    }
  }
});

// initial load
loadStudents();
