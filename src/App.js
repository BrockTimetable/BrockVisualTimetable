import { DepartmentSearchComponent, NavbarComponent, TermSelectComponent, CalendarComponent, CourseListComponent} from './components'
import './css/App.css';
function App() {
  return (
    <>
        <NavbarComponent></NavbarComponent>
        <TermSelectComponent></TermSelectComponent>
        <DepartmentSearchComponent></DepartmentSearchComponent>
        <div id = "contentArea">
          <CourseListComponent></CourseListComponent>
          <CalendarComponent></CalendarComponent>
        </div>
    </>
  );
}

export default App;
