// 创建一个观察对象
class Observer {
  constructor(data) {
    // 提供一个解析方法,完成属性的分析和挟持()
    this.observe(data);
  }

  // 解析数据,完成对数据属性的'挟持'(控制对象属性的getter和setter方法)
  observe(data) {
    // 判断数据的有效性(必须是对象)
    if (!data || typeof data !== 'object') {
      return;
    }
    // 针对当前对象属性的重新定义
    var keys = Object.keys(data); //返回的是一个对象的键的数组
    keys.forEach(key => {
      // 重新定义key
      this.defineReactive(data, key, data[key]);
    });
  }

  defineReactive(obj, key, val) {
    var dep = new Dep();
    // 重新定义
    // 1) 目标对象
    // 2) 属性名
    // 3) 属性配置
    Object.defineProperty(obj, key, {
      enumerable: false, // 是否可以遍历
      configurable: false, // 是否可以重新配置
      // 特权方法:getter取值
      get() {
        // 针对watcher创建时,直接完成发布订阅的添加
        Dep.target && dep.addSub(Dep.target);
        // 返回属性
        return val;
      },
      set(newValue) {
        // 把新值覆盖覆盖到旧值
        val = newValue;
        dep.notify();
      }
    });
  }
}

// 创建发布者
// 1.管理订阅者
// 2.通知
class Dep {
  constructor() {
    this.subs = [];
  }

  // 添加订阅
  addSub(sub) {
    // 其实就是watcher实例
    this.subs.push(sub);
  }

  // 集体通知
  notify() {
    this.subs.forEach(sub => {
      sub.update();
    });
  }
}
